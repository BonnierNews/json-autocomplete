import { createJsonAutocomplete } from "./create-json-autocomplete";

export function jsonAutocomplete(
  incompleteJsonString: string,
  autocompleter: ReturnType<typeof createJsonAutocomplete> = createJsonAutocomplete()
) {
  return autocompleter.append(incompleteJsonString);
}
