# Selection Scope Sample

Copyright © Bentley Systems, Incorporated. All rights reserved.

This sample demonstrates how Selection Scope works with Geometric Elements and allows you to see how the different scopes function. This sample never changes the Selection Scope used by the Viewer. Instead, the Viewer always uses Element Scope and the functions/classes in this sample calculate what would have been selected/hilited based on the scope you choose and the element’s id. This sample assumes that we are working with Geometric Elements, however there exists other scopes that target other types of elements (such as Models).

## What is Selection Scope?

Selection scope refers to what element(s) get selected when you click on an element in the iModel viewport (or programmatically select an element through code). This sample allows you to select between 3 options: Element Scope, Assembly Scope, or Top Assembly Scope. These three scopes are used in the sample to select Geometric Elements when given the id of a Geometric element.

## What is Element Scope?

If you are using “Element Scope”, the element you click on is the element that gets selected. For example, if you click on an element with the id “0x70000000012”, the element with id “0x70000000012” will be selected.

## What is Assembly scope?

Some elements may have a parent element. This parent element is known as an “Assembly” because it assembles its children. If you are using “Assembly Scope”, the element you click on has its parent element selected. If there is no parent element, then the scope behaves the same as “Element Scope”. For example, if you click on an element with the id “0x70000000012”, that element’s parent with id “0x40000000391” will be selected. More details about Assembly Elements can be found [in the documentation](https://www.itwinjs.org/bis/guide/fundamentals/element-fundamentals/#assemblies).

## What is Top Assembly scope?

Assembly elements can be nested. This means that some elements may have a parent that has a parent that has a parent (this nesting can go on forever, meaning the original element has a parent, grandparent, great-grandparent, etc.). If you are using “Top Assembly Scope”, the element you click on has its topmost parent element selected. If there is no parent element, then the scope behaves the same as “Element Scope”. For example, if you click on an element with the id “0x70000000012”, that element’s grandparent with id “0x40000000390” will be selected.

## Are there other Selection Scopes?

Yes, there are two more selections scopes that are not covered in this sample. Those selection scopes are "Model" and "Category". This sample showcases how Selection Scope interacts with Geometric Elements, while those scopes will allow selection of the model containing the element and selection of the element's category (respectively). Another note is that the [getSelectionScopes function](https://www.itwinjs.org/reference/presentation-frontend/unifiedselection/selectionscopesmanager/getselectionscopes/) usually only returns the scopes that interact with Geometric Elements (Element, Assembly, or Top Assembly). However, Model scope and Category scope are still supported by our library and can be used in most cases despite not being returned from that function.

## Extra resources

More about selection scope can be found in the [Unified Selection documentation](https://www.itwinjs.org/presentation/unified-selection/).