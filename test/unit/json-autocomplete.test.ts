import { expect } from "chai";

import { jsonAutocomplete } from "../../lib/json-autocomplete";
import { createJsonAutocomplete } from "../../lib/create-json-autocomplete";

interface TestCase {
  input: string;
  expected: string;
}

describe("createJsonAutocomplete", () => {
  const testCases: TestCase[] = [
    { input: '{"key": "value"', expected: '{"key": "value"}' },
    { input: "[1, 2, 3", expected: "[1, 2, 3]" },
    { input: '{"key": "value', expected: '{"key": "value"}' },
    { input: '{"key": ', expected: '{"key": null}' },
    { input: '{"key"', expected: '{"key":null}' },
    { input: '{"ke', expected: '{"ke":null}' },
    { input: '{"key": "hello", "test":', expected: '{"key": "hello", "test":null}' },
    { input: '{"a": {"b": [1, 2', expected: '{"a": {"b": [1, 2]}}' },
    { input: '{"text": "He said, \\"Hello\\nWorld', expected: '{"text": "He said, \\"Hello\\nWorld"}' },
    { input: '{"a": [1, 2, {"b": ', expected: '{"a": [1, 2, {"b": null}]}' },
    { input: '{"a": 1,', expected: '{"a": 1}' },
    { input: "", expected: "" },
    { input: '{"complete": true, "items": [1, 2, 3]}', expected: '{"complete": true, "items": [1, 2, 3]}' },
    { input: '{"age": 25', expected: '{"age": 25}' },
    { input: '{"isActive": true', expected: '{"isActive": true}' },
    { input: '{"value": null', expected: '{"value": null}' },
    { input: '{"a": {"b": {"c": [1, 2, {"d": "text"', expected: '{"a": {"b": {"c": [1, 2, {"d": "text"}]}}}' },
    { input: '{\n  "name": "John",\n  "age": 30', expected: '{\n  "name": "John",\n  "age": 30}' },
    { input: '[1, "two", true, null, {"five": 5', expected: '[1, "two", true, null, {"five": 5}]' },
    {
      input: '{"incompleteEscape": "This is a backslash \\',
      expected: '{"incompleteEscape": "This is a backslash \\"}',
    },
    { input: '{"key\\"name": "value', expected: '{"key\\"name": "value"}' },
    {
      input: '[{"id": 1, "name": "Item1"}, {"id": 2, "name": "Item2"',
      expected: '[{"id": 1, "name": "Item1"}, {"id": 2, "name": "Item2"}]',
    },
    { input: '{"emptyArray": [', expected: '{"emptyArray": []}' },
    { input: '{"emptyObject": {', expected: '{"emptyObject": {}}' },
  ];

  testCases.forEach(({ input, expected }) => {
    it(`should autocomplete '${input}' to '${expected}' with single append`, () => {
      const result = jsonAutocomplete(input);
      expect(result).to.equal(expected);
    });
  });

  testCases.forEach(({ input, expected }) => {
    it(`should incrementally complete '${input}' to '${expected}' using append`, () => {
      const autoCompleter = createJsonAutocomplete();
      const splitPoint = Math.floor(input.length / 2);
      const firstPart = input.slice(0, splitPoint);
      const secondPart = input.slice(splitPoint);

      autoCompleter.append(firstPart);
      const intermediateResult = autoCompleter.append(secondPart);
      expect(intermediateResult).to.equal(expected);
    });
  });
});
