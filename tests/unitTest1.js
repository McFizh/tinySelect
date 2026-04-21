$("#select1").tinyselect({ searchDebounce: 0 });
$("#select2").tinyselect({ searchDebounce: 0 });
$("#select3").tinyselect({ searchDebounce: 0 });

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

QUnit.test("Structure creation", async (assert) => {
  // This element should exist if plugin works at all
  const el1 = document.querySelector("#select1_ts");
  assert.ok(el1, "Structure found");

  // Try to find and click menu
  const el2 = document.querySelector("#select1_ts div.selectbox");
  assert.equal("selectbox", el2.className, "Select is closed by default");
  el2.click();
  assert.equal("selectbox open", el2.className, "Select opened when clicked");

  // Try to find searchbox
  const el3 = document.querySelector("input.searchbox");
  const el4 = document.querySelector("ul.itemcontainer");
  assert.ok(el3, "Search input field found");
  assert.equal(el4.children.length, 8, "All children present in optionlist");

  // Wait is needed, otherwise debounce (even if set to 0) doesn't have time to do it's magic

  // This should not return anything
  el3.value = "option 1";
  el3.dispatchEvent(new Event("keyup"));
  await wait(50);
  assert.equal(el4.children.length, 0, "Search should not return anything");

  // This should return one item (enabled, selected)
  el3.value = "option a";
  el3.dispatchEvent(new Event("keyup"));
  await wait(50);
  assert.equal(el4.children.length, 1, "Search should return one item (enabled, selected)");
  assert.ok(el4.children[0].classList.contains("selected"));
  assert.notOk(el4.children[0].classList.contains("disabled"));

  // This should return one item (enabled, not selected)
  el3.value = "option b";
  el3.dispatchEvent(new Event("keyup"));
  await wait(50);
  assert.equal(el4.children.length, 1, "Search should return one item (enabled, not selected)");
  assert.notOk(el4.children[0].classList.contains("selected"));
  assert.notOk(el4.children[0].classList.contains("disabled"));

  // This should return one item (disabled)
  el3.value = "option f";
  el3.dispatchEvent(new Event("keyup"));
  await wait(50);
  assert.equal(el4.children.length, 1, "Search should return one item (disabled, not selected)");
  assert.notOk(el4.children[0].classList.contains("selected"));
  assert.ok(el4.children[0].classList.contains("disabled"));
});

QUnit.test("Loading ajax content", async (assert) => {
  $("#select2").tinyselect("setDataUrl", "testcontent.json");

  // This triggers ajax loading
  const selectBox = document.querySelector("#select2_ts .selectbox");
  selectBox.click();
  await wait(150);

  // Should have 2 items (fetched from json file)
  const items = document.querySelector("#select2_ts ul.itemcontainer");
  assert.equal(items.children.length, 2);

  // Close the box
  selectBox.click();
});

QUnit.test("Disabled state", async (assert) => {
  const selectBox = document.querySelector("#select3_ts .selectbox");
  assert.ok(document.querySelector("#select3_ts"), "Structure found");
  assert.ok(selectBox.classList.contains("disabled"), "Select has disabled class");
  assert.notOk(selectBox.hasAttribute("tabindex"), "Should not have tabindex");

  selectBox.click();
  assert.notOk(selectBox.classList.contains("open"), "Should not open on click");
});
