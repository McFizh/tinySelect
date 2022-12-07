$("#select1").tinyselect();

QUnit.test("Structure creation", ( assert ) => {
  // This element should exist if plugin works at all
  const el1 = document.querySelector("#select1_ts");
  assert.ok( el1 , "Structure found" );

  // Try to find and click menu
  const el2 = document.querySelector("div.selectbox");
  assert.equal( "selectbox", el2.className, "Select is closed by default" );
  el2.click();
  assert.equal( "selectbox open", el2.className, "Select opened when clicked" );

  // Try to find searchbox
  const el3 = document.querySelector("input.searchbox");
  const el4 = document.querySelector("ul.itemcontainer");
  assert.ok( el3 , "Search input field found" );
  assert.equal(el4.children.length, 8, "All children present in optionlist");

  el3.value = "option 1";
  el3.dispatchEvent(new Event("keyup"));
  assert.equal(el4.children.length, 0, "Search test1");

  el3.value = "option a";
  el3.dispatchEvent(new Event("keyup"));
  assert.equal(el4.children.length, 1, "Search test2");

});

