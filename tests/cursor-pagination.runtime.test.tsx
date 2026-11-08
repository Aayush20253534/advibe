import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { CursorPagination } from "../src/components/ui/cursor-pagination";

const noop = () => {};
test("a final cursor page still renders an enabled way back to the first page", () => {
  const html = renderToStaticMarkup(<CursorPagination busy={false} hasPrevious hasNext={false} onFirst={noop} onNext={noop}/>);
  const buttons = [...html.matchAll(/<button([^>]*)>([^<]*)<\/button>/g)];
  assert.equal(buttons.length, 2);
  assert.equal(buttons[0]?.[2], "First page");
  assert.doesNotMatch(buttons[0]![1], /disabled=""/);
  assert.match(buttons[1]![1], /disabled=""/);
  assert.match(html, /Last page/);
});
test("a single-page list omits paging; loading disables both navigation buttons", () => {
  assert.equal(renderToStaticMarkup(<CursorPagination busy={false} hasPrevious={false} hasNext={false} onFirst={noop} onNext={noop}/>), "");
  const html = renderToStaticMarkup(<CursorPagination busy hasPrevious hasNext onFirst={noop} onNext={noop}/>);
  assert.equal([...html.matchAll(/disabled=""/g)].length, 2);
  assert.match(html, /Loading records/);
});
