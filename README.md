# Find Your Hat

This project has been suggested on [Codecademy](https://www.codecademy.com/) as part of their Full-Stack Engineer Career Path.

## Project Goal

Build an interactive terminal game in Node.js. The scenario is that the player has lost their hat in a field full of holes, and they must navigate back to it without falling down one of the holes or stepping outside of the field.

### Demo

![Demonstration provided by Codecademy](./docs/find-your-hat-demo.gif)

### Main Requirements

* The project is centered on a <code>Field</code> class. The <code>Field</code> constructor should take a two-dimensional array representing the “field” itself. A field consists of a grid containing “holes” (<code>O</code>) and one “hat” (<code>^</code>). The neutral background character (<code>░</code>) indicates the rest of the field itself. The player will begin in the upper-left of the field, and the player’s path is represented by <code>*</code>.

* The <code>Field</code> has <code>generateField()</code> method that should takes arguments for height and width of the field, and it should return a randomized two-dimensional array representing the field with a hat and one or more holes. Besides, a third percentage argument is used to determine what percent of the field should be covered in holes. 

* When a user runs <code>main.js</code>, they are prompted for input and choose which direction they’d like to “move” (<code>u d l r</code>).

* After entering an instruction, the user should see a printed result of their current field map with the tiles they have visited marked with <code>*</code>. They should be prompted for their next move.

* This continues until the user wins by finding their hat.

* The uses loses by landing on (and falling in) a hole.

* If the user attempts to move “outside” the field s/he gets a hint and another try.

### Added Features

* The character starts on a random location that’s not the upper-left corner.

* A field validator ensures that the field generated by <code>Field.generateField()</code> can actually be solved. 

* Improved game’s graphics and interactivity in the terminal.