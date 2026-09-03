const fs = require("fs/promises");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");
const DATA_FILE = path.join(DATA_DIR, "students.json");

// Create data file if it does not exist
async function initializeData() {
    try {
        await fs.access(DATA_FILE);
    } catch {
        await fs.mkdir(DATA_DIR, { recursive: true });
        await fs.writeFile(DATA_FILE, "[]");
    }
}

// Read students from JSON file
async function loadStudents() {
    await initializeData();

    try {
        const data = await fs.readFile(DATA_FILE, "utf8");
        return JSON.parse(data);
    } catch (error) {
        console.log("Error reading student data.");
        return [];
    }
}

// Save students to JSON file
async function saveStudents(students) {
    await fs.writeFile(
        DATA_FILE,
        JSON.stringify(students, null, 2)
    );
}

// Show help
function showHelp() {
    console.log(`
Student Record Tool

Commands:

  npm start -- add <register> "<name>" "<programme>"
  npm start -- list
  npm start -- find <register>
  npm start -- delete <register>

Examples:

  npm start -- add 2026001 "John Smith" "Computer Science"
  npm start -- list
  npm start -- find 2026001
  npm start -- delete 2026001
`);
}

// Add student
async function addStudent(register, name, programme) {
    if (!register || !name || !programme) {
        console.log("Error: register number, name and programme are required.");
        return;
    }

    const students = await loadStudents();

    const exists = students.some(
        student => student.register === register
    );

    if (exists) {
        console.log(`Error: Student with register number ${register} already exists.`);
        return;
    }

    const student = {
        register,
        name,
        programme
    };

    students.push(student);

    await saveStudents(students);

    console.log("Student added successfully.");
}

// List students
async function listStudents() {
    const students = await loadStudents();

    if (students.length === 0) {
        console.log("No student records found.");
        return;
    }

    console.log("\nStudent Records:\n");

    students.forEach((student, index) => {
        console.log(`${index + 1}.`);
        console.log(`Register: ${student.register}`);
        console.log(`Name: ${student.name}`);
        console.log(`Programme: ${student.programme}`);
        console.log("----------------------------");
    });
}

// Find student
async function findStudent(register) {
    if (!register) {
        console.log("Error: Please provide a register number.");
        return;
    }

    const students = await loadStudents();

    const student = students.find(
        student => student.register === register
    );

    if (!student) {
        console.log(`No student found with register number ${register}.`);
        return;
    }

    console.log("\nStudent Found:");
    console.log(`Register: ${student.register}`);
    console.log(`Name: ${student.name}`);
    console.log(`Programme: ${student.programme}`);
}

// Delete student
async function deleteStudent(register) {
    if (!register) {
        console.log("Error: Please provide a register number.");
        return;
    }

    const students = await loadStudents();

    const index = students.findIndex(
        student => student.register === register
    );

    if (index === -1) {
        console.log(`No student found with register number ${register}.`);
        return;
    }

    const deletedStudent = students[index];

    students.splice(index, 1);

    await saveStudents(students);

    console.log(
        `Student ${deletedStudent.name} deleted successfully.`
    );
}

// Main program
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    switch (command) {
        case "add":
            await addStudent(args[1], args[2], args[3]);
            break;

        case "list":
            await listStudents();
            break;

        case "find":
            await findStudent(args[1]);
            break;

        case "delete":
            await deleteStudent(args[1]);
            break;

        case "help":
        case undefined:
            showHelp();
            break;

        default:
            console.log(`Unknown command: ${command}`);
            showHelp();
    }
}

main();