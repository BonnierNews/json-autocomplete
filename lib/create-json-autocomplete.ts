/**
 * Utility to incrementally build a complete JSON string
 * from potentially incomplete JSON append operations.
 */
export function createJsonAutocomplete() {
  let accumulatedString = "";
  let bracketStack: string[] = [];
  let isInString = false;
  let isEscaping = false;
  let expectingValue = false;

  return {
    /**
     * Appends a part of the JSON to the internal structure
     * and returns the best possible valid JSON string.
     *
     * @param part - A fragment of JSON which may be incomplete.
     * @returns A valid JSON string constructed from all appended fragments.
     */
    append(part: string): string {
      const tempStack = [ ...bracketStack ];
      let tempIsInString = isInString;
      let tempIsEscaping = isEscaping;
      let tempExpectingValue = expectingValue;

      for (let i = 0; i < part.length; i++) {
        const currentChar = part[i];
        if (tempIsEscaping) {
          tempIsEscaping = false;
          continue;
        }
        if (currentChar === "\\") {
          tempIsEscaping = true;
          continue;
        }
        if (currentChar === '"') {
          tempIsInString = !tempIsInString;
          if (!tempIsInString && tempExpectingValue) {
            tempExpectingValue = false;
          }
          continue;
        }
        if (!tempIsInString) {
          if (tempExpectingValue) {
            if (/\s/.test(currentChar)) {
              continue;
            }
            if (
              currentChar === '"' ||
              currentChar === "{" ||
              currentChar === "[" ||
              currentChar === "t" ||
              currentChar === "f" ||
              currentChar === "n" ||
              /[\d-]/.test(currentChar)
            ) {
              tempExpectingValue = false;
            }
          }
          if (currentChar === "{" || currentChar === "[") {
            tempStack.push(currentChar);
          } else if (currentChar === "}") {
            if (tempStack.pop() !== "{") throw new Error("Unbalanced braces");
          } else if (currentChar === "]") {
            if (tempStack.pop() !== "[") throw new Error("Unbalanced brackets");
          } else if (currentChar === ":") {
            tempExpectingValue = true;
          } else if (/[,\]}]/.test(currentChar)) {
            tempExpectingValue = false;
          }
        }
      }

      accumulatedString += part;
      bracketStack = tempStack;
      isInString = tempIsInString;
      isEscaping = tempIsEscaping;
      expectingValue = tempExpectingValue;

      let completedJson = accumulatedString;
      if (expectingValue && !isInString) {
        completedJson += "null";
        expectingValue = false;
      }
      if (isInString) {
        completedJson += '"';
      }

      completedJson = completedJson.replace(/,\s*([}\]])/g, "$1").replace(/,\s*$/g, "");
      for (let i = bracketStack.length - 1; i >= 0; i--) {
        const openBracket = bracketStack[i];
        completedJson += openBracket === "{" ? "}" : "]";
      }
      return completedJson;
    },
  };
}
