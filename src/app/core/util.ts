export class Name {

  static firstCommaLast(firstName: string, lastName: string): string {
    return firstName && lastName
    ? lastName + ', ' + firstName
    : firstName && !lastName
      ? firstName
      : !firstName && lastName
        ? lastName
        : null;
  }
}