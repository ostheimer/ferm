export function isMissingColumnError(error: unknown, tableName: string, columnName: string) {
  const code = readPgErrorCode(error);

  if (code === "42703") {
    return true;
  }

  const message = readErrorMessage(error);

  return (
    message.includes(`"${tableName}"."${columnName}"`) ||
    message.includes(`column "${columnName}"`) ||
    message.includes(`column ${columnName}`)
  );
}

export function isMissingTableError(error: unknown, tableName: string) {
  const code = readPgErrorCode(error);

  if (code === "42P01") {
    return true;
  }

  const message = readErrorMessage(error);

  return message.includes(`"${tableName}"`) && message.includes("does not exist");
}

function readPgErrorCode(error: unknown) {
  if (!error || typeof error !== "object") {
    return undefined;
  }

  const directCode = "code" in error ? error.code : undefined;

  if (typeof directCode === "string") {
    return directCode;
  }

  const cause = "cause" in error ? error.cause : undefined;

  if (cause && typeof cause === "object" && "code" in cause && typeof cause.code === "string") {
    return cause.code;
  }

  return undefined;
}

function readErrorMessage(error: unknown) {
  if (!error || typeof error !== "object" || !("message" in error) || typeof error.message !== "string") {
    return "";
  }

  return error.message.toLowerCase();
}
