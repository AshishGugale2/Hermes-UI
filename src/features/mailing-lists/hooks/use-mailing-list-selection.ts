import { useState } from "react";

import { useGetMailingListsQuery } from "../api/mailing-lists-api";

export function useMailingListSelection() {
  const query = useGetMailingListsQuery();
  const lists = query.data ?? [];
  const [selectedId, setSelectedId] = useState("");
  const selectedList =
    lists.find((list) => String(list.id) === selectedId) ?? lists[0];

  return {
    ...query,
    lists,
    selectedId: selectedList ? String(selectedList.id) : "",
    setSelectedId,
  };
}
