$("#select1").tinyselect();

QUnit.test("Structure creation", ( assert ) => {
  const ts1 = $("#select1_ts");

  assert.expect(1);
  assert.equal( 1 , ts1.length , "Structure found" );
});

