export function validationError(message: string) {
  return Object.assign(new Error(message), {
    status: 400,
    code: "validation-error"
  });
}
