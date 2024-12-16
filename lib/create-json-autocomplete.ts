function getPreviousChar(str: string, from: number): string | null {
  for (let i = from - 1; i >= 0; i--) {
    if (str[i] !== " " && str[i] !== "\t" && str[i] !== "\n" && str[i] !== "\r") {
      return str[i];
    }
  }
  return null;
}

/**
 * Utility to incrementally build a complete JSON string
 * from potentially incomplete JSON append operations.
 */

export function createJsonAutocomplete() {
  let accumulated = "";
  const stack: string[] = [];
  let inString = false;
  let inProperty = false;
  return {
    /**
     * Appends a part of the JSON to the internal structure
     * and returns the best possible valid JSON string.
     *
     * @param part - A fragment of JSON which may be incomplete.
     * @returns A valid JSON string constructed from all appended fragments.
     */
    append(part: string): string {
      const tempAccumulated = accumulated + part;
      for (let i = accumulated.length; i < tempAccumulated.length; i++) {

        const currentChar = tempAccumulated[i];
        accumulated += currentChar;
        if (getPreviousChar(tempAccumulated, i) === "\\") {
          continue;
        }

        if (currentChar === '"') {
          if (stack[stack.length - 1] === '"') {
            stack.pop();
            inString = false;
          } else {
            stack.push('"');
            const previousChar = getPreviousChar(tempAccumulated, i);
            if (previousChar === "," || previousChar === "{") {
              inProperty = true;
              inString = false;
            } else {
              inString = true;
            }
          }
          continue;
        }

        if (inString) {
          continue;
        }

        switch (currentChar) {
          case "{": {
            stack.push("}");
            break;
          }
          case "[": {
            stack.push("]");
            break;
          }
          case "}": {
            if (stack[stack.length - 1] !== "}") throw new Error("Unbalanced brackets");
            stack.pop();
            break;
          }
          case "]": {
            if (stack[stack.length - 1] !== "]") throw new Error("Unbalanced brackets");
            stack.pop();
            break;
          }
          case ":": {
            inProperty = false;
            inString = false;
          }
        }
      }

      let autocompletedJson = accumulated;
      const temporaryStack = [ ...stack ];

      if (inProperty) {
        if (temporaryStack[temporaryStack.length - 1] !== '"') {
          const previousChar = getPreviousChar(autocompletedJson, autocompletedJson.length);
          if (previousChar === '"') {
            const lastCommaIndex = autocompletedJson.lastIndexOf(",");
            const lastBraceIndex = autocompletedJson.lastIndexOf("{");
            if (lastCommaIndex > lastBraceIndex) {
              autocompletedJson = autocompletedJson.substring(0, lastCommaIndex);
            } else {
              autocompletedJson = autocompletedJson.substring(0, lastBraceIndex + 1);
            }
          }
        } else {
          const lastCommaIndex = autocompletedJson.lastIndexOf(",");
          const lastBraceIndex = autocompletedJson.lastIndexOf("{");
          if (lastCommaIndex > lastBraceIndex) {
            autocompletedJson = autocompletedJson.substring(0, lastCommaIndex);
          } else {
            autocompletedJson = autocompletedJson.substring(0, lastBraceIndex + 1);
          }
          temporaryStack.pop();
        }
      }

      // remove trailing commas
      if (!inString && getPreviousChar(autocompletedJson, autocompletedJson.length) === ",") {
        autocompletedJson = autocompletedJson.substring(0, autocompletedJson.lastIndexOf(","));
      }

      if (temporaryStack[temporaryStack.length - 1] === "}" && getPreviousChar(autocompletedJson, autocompletedJson.length) === ":") {
        const lastCommaIndex = autocompletedJson.lastIndexOf(",");
        const lastBraceIndex = autocompletedJson.lastIndexOf("{");
        if (lastCommaIndex > lastBraceIndex) {
          autocompletedJson = autocompletedJson.substring(0, lastCommaIndex);
        } else {
          autocompletedJson = autocompletedJson.substring(0, lastBraceIndex + 1);
        }
      }

      const reversedStack = temporaryStack.reverse();

      for (const bracket of reversedStack) {
        autocompletedJson += bracket;
      }

      return autocompletedJson;
    },
  };
}
