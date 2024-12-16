function getPreviousChar(str: string, from: number): string | null {
  const whitespace = " \t\n\r";
  for (let i = from - 1; i >= 0; i--) {
    const char = str[i];
    if (!whitespace.includes(char)) {
      return char;
    }
  }
  return null;
}

// Helper function to trim autocompletedJson
const trimJson = (autocompletedJson: string) => {
  const lastComma = autocompletedJson.lastIndexOf(",");
  const lastBrace = autocompletedJson.lastIndexOf("{");
  return lastComma > lastBrace
    ? autocompletedJson.substring(0, lastComma)
    : autocompletedJson.substring(0, lastBrace + 1);
};

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
            const prevChar = getPreviousChar(tempAccumulated, i);
            inProperty = prevChar === "," || prevChar === "{";
            inString = !inProperty;
          }
          continue;
        }

        if (inString) {
          continue;
        }

        switch (currentChar) {
          case "{":
            stack.push("}");
            break;
          case "[":
            stack.push("]");
            break;
          case "}":
          case "]":
            if (currentChar !== stack.pop()) {
              throw new Error("Unbalanced brackets");
            }
            break;
          case ":":
            inProperty = false;
            inString = false;
            break;
        }
      }

      let autocompletedJson = accumulated;
      const temporaryStack = [ ...stack ];

      if (inProperty) {
        if (temporaryStack[temporaryStack.length - 1] !== '"') {
          const previousChar = getPreviousChar(autocompletedJson, autocompletedJson.length);
          if (previousChar === '"') {
            autocompletedJson = trimJson(autocompletedJson);
          }
        } else {
          autocompletedJson = trimJson(autocompletedJson);
          temporaryStack.pop();
        }
      }

      // remove trailing commas
      if (!inString && getPreviousChar(autocompletedJson, autocompletedJson.length) === ",") {
        autocompletedJson = autocompletedJson.substring(0, autocompletedJson.lastIndexOf(","));
      }

      if (
        temporaryStack[temporaryStack.length - 1] === "}" &&
        getPreviousChar(autocompletedJson, autocompletedJson.length) === ":"
      ) {
        autocompletedJson = trimJson(autocompletedJson);
      }

      return autocompletedJson + temporaryStack.reverse().join("");
    },
  };
}
