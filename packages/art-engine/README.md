# Art Engine

The HashLips Lab's Art Engine 2 is currently in its alpha phase and is actively
being developed by [Daniel](https://github.com/HashLips) and
[Marco](https://github.com/Liarco).

As with any software in its early stages, there may be bugs present that have
not yet been discovered or resolved. The development team is working diligently
to iron out any issues and bring the engine to a stable and functional state.

### Edge Cases

The Art Engine 2 is capable of generating different art based on other traits.
For example, a trait may be a color, and the color may be used to determine
which other traits are used to generate the art. This is a powerful feature
that allows for a wide variety of art to be generated from a single set of
traits.

There are 2 types of edge case, file based and folder based.
Both of these reside in a subfolder called `edge-cases` in the `traits` folder.

#### File Based

In order to define a file based edge case, you must create a file with that
starts with the name of the trait that it is an edge case for.
For example, if you have a trait called `backpack.png` then the filein the
`edge-cases` folder also starts with `backpack`

Then we need to add 2 (two) underscores `__` followed by the name of the trait
that influences this edge case. Lets say for example that `body` can be `grownup`
or `kid` then the next part of the file name would be `__body`

Finally we need to add 2 (two) underscores `__` again followed by the value of the
edge case, in this case `grownup` or `kid`. Lets say the growup is the default case
then we would only have to define an edge case for `kid` and the file name would
become `backpack__body__kid.png`

#### Folder Based

If we want to define a many edge case for a specific other trait, we can also create
a folder where the trait and the value are defined in the folder name, so that the
file names inside the folder can remain the same as in the root of the folder.
This way we can define many edge cases for a single trait at once.
