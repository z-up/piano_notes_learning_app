file = open("keys.svg", "w")

# white keys
file.write("<!-- white keys -->\n")
white_key_names = "ABCDEFG"

for i in range(0, 52):
    note_name = white_key_names[i % 7]
    octave_number = (i + 5) // 7
    file.write(f'<use xlink:href="#wk" id="{note_name}_{octave_number}" x="{23 * i}" />\n')

# black keys
file.write("\n<!-- black keys -->\n")
file.write(f'<use xlink:href="#bk" id="A♯0" x="{134.75 - 23 * 5}" />\n')
black_key_names = "CDFGA"
black_key_x_offsets = [14.33333, 41.66666, 82.25, 108.25, 134.75] # offsets within octave
for octave in range(1, 8):
    for (name, offset) in zip(black_key_names, black_key_x_offsets):
        x = 46 + (23 * 7) * (octave - 1) + offset
        file.write(f'<use xlink:href="#bk" id="{name}♯_{octave}" x="{x}" />\n')

file.close()
