export function getPageViewMessage(e: Event): IPageViewMessage|null {
  if (!(e.target instanceof Element)) {
    return null
  }
  const comMsg = getCommonMessage();
  const data: IClickEventMessage = {
    ...comMsg,
    $event_id: '$page_view',
  }
  return data;
}