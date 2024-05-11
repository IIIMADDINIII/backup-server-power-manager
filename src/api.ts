
/**
 * print an Hello World message to the Console
 * @param exclamation - true = append an Exclamation mark to the message
 * @returns the printed message
 * @public
 */
export function helloWorld(exclamation: boolean): string {
  let str = "Hello World";
  if (exclamation) str += "!";
  console.log(str);
  return str;
}