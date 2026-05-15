import type { ContactEntry, ContactList, RegisteredContact } from "@hege/domain";
import { describe, expect, it, vi } from "vitest";

import type { RequestContext } from "../../auth/context";
import type { ContactsRepository } from "./repository";
import { createContactsService } from "./service";

const adminContext: RequestContext = {
  userId: "user-admin",
  membershipId: "member-admin",
  revierId: "revier-attersee",
  role: "revier-admin"
};

const regularContext: RequestContext = {
  ...adminContext,
  membershipId: "member-ausgeher",
  role: "ausgeher"
};

const now = "2026-05-15T12:00:00.000Z";
const member: RegisteredContact = {
  membershipId: "member-admin",
  userId: "user-admin",
  name: "Anna Müller",
  phone: "+43 660 1001001",
  role: "revier-admin",
  jagdzeichen: "RL-01"
};

describe("contacts service", () => {
  it("creates linked member contacts without copying name or phone", async () => {
    const repository = createRepository({
      insertEntry: vi.fn(async () => undefined),
      getEntry: vi.fn(async () =>
        createEntryFixture({
          membershipId: member.membershipId,
          name: member.name,
          phone: member.phone,
          linkedMember: member
        })
      )
    });
    const service = createContactsService({
      repository,
      generateId: (prefix) => `${prefix}-new`,
      getNow: () => now,
      useDemoStore: false
    });

    const result = await service.createEntry(adminContext, "contact-list-1", {
      membershipId: member.membershipId,
      funktion: "Revierleitung"
    });

    expect(result.linkedMember).toMatchObject({ membershipId: member.membershipId });
    expect(result.name).toBe("Anna Müller");
    const inserted = vi.mocked(repository.insertEntry).mock.calls[0]?.[0];
    expect(inserted).toMatchObject({
      id: "contact-entry-new",
      listId: "contact-list-1",
      revierId: "revier-attersee",
      membershipId: member.membershipId,
      funktion: "Revierleitung"
    });
    expect(inserted).not.toHaveProperty("name");
    expect(inserted).not.toHaveProperty("phone");
  });

  it("rejects duplicate linked members within the same list", async () => {
    const repository = createRepository({
      findEntryByMembership: vi.fn(async () => ({
        id: "contact-entry-existing"
      }) as never)
    });
    const service = createContactsService({ repository, useDemoStore: false });

    await expect(
      service.createEntry(adminContext, "contact-list-1", {
        membershipId: member.membershipId
      })
    ).rejects.toMatchObject({
      status: 409
    });
  });

  it("allows regular members to read but not manage contacts", async () => {
    const repository = createRepository();
    const service = createContactsService({ repository, useDemoStore: false });

    await expect(service.listDirectory(regularContext)).resolves.toMatchObject({
      canManage: false
    });
    await expect(service.createList(regularContext, { title: "Tierärzte" })).rejects.toMatchObject({
      status: 403
    });
  });
});

function createRepository(overrides: Partial<ContactsRepository> = {}): ContactsRepository {
  return {
    listDirectory: vi.fn(async () => ({
      registeredMembers: [member],
      lists: [createListFixture()]
    })),
    findList: vi.fn(async () => ({
      id: "contact-list-1",
      revierId: "revier-attersee",
      title: "Weidkameraden",
      position: 10,
      createdAt: now,
      updatedAt: now
    })),
    getList: vi.fn(async () => createListFixture()),
    findEntry: vi.fn(async () => undefined),
    getEntry: vi.fn(async () => createEntryFixture()),
    findEntryByMembership: vi.fn(async () => undefined),
    findMembership: vi.fn(async () => member),
    insertList: vi.fn(async () => undefined),
    updateList: vi.fn(async () => true),
    deleteList: vi.fn(async () => true),
    insertEntry: vi.fn(async () => undefined),
    updateEntry: vi.fn(async () => true),
    deleteEntry: vi.fn(async () => true),
    ...overrides
  };
}

function createListFixture(overrides: Partial<ContactList> = {}): ContactList {
  return {
    id: "contact-list-1",
    revierId: "revier-attersee",
    title: "Weidkameraden",
    position: 10,
    entries: [],
    createdAt: now,
    updatedAt: now,
    ...overrides
  };
}

function createEntryFixture(overrides: Partial<ContactEntry> = {}): ContactEntry {
  return {
    id: "contact-entry-1",
    listId: "contact-list-1",
    revierId: "revier-attersee",
    name: "Josef Schneider",
    phone: "+43 664 1204501",
    position: 10,
    createdAt: now,
    updatedAt: now,
    ...overrides
  };
}
