##How to use##
The component provides 3 columns of paragraphs but to display correctly, it needs to be wrapped in a Section style.

1. Add a 'Content column block' pane to your panel page. It is located in the 'UQ Content Types' group.
2. Enter a title to identify the pane and add as many paragraphs as required.
3. Edit the CSS Properties of the pane and enter ```content-column-block``` in the CSS class field.
4. Change the pane Style to 'Section' and add a background image. Set the top spacing to 'No padding'.

###Notes on functionality###
All paragraphs are wrapped in the [.pane style](../panes/README.md). The left column will also apply a background colour in an alternating light,dark pattern. Only the left column will apply a background colour.

If there are no paragraphs in the left column, the middle and right columns will stay the same size but shift across to a left alignment.
Likewise, if there are no paragraphs in the middle or right columns, the other columns will shift across.
