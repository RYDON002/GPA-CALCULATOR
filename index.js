// Optional: Logout function for user session management
function logout() {
	localStorage.removeItem("loggedUser");
	window.location.href = "login.html";
}
let semesters = [];

// Get logged-in user
const loggedUser = localStorage.getItem("loggedUser");
if (!loggedUser) {
	window.location.href = "login.html";
}

function getUserKey() {
	return `savedSemesters_${loggedUser}`;
}
function gradeToPoint(grade) {
	switch (grade.toUpperCase()) {
		case 'A': return 5;
		case 'B': return 4;
		case 'C': return 3;
		case 'D': return 2;
		case 'E': return 1;
		default: return 0;
	}
}
function createSemester() {
	const name = document.getElementById('semesterName').value.trim();
	if (!name) return alert("Enter semester name.");
	const index = semesters.length;
	semesters.push({ name, courses: [] });
	const container = document.createElement("div");
	container.className = "semester-box";
	container.innerHTML = `
		<h2>${name}</h2>
		<label>Course Name:</label>
		<input type="text" id="courseName${index}">
		<label>Credit Unit:</label>
		<input type="number" id="creditUnit${index}">
		<label>Grade:</label>
		<select id="grade${index}">
			<option value="A">A (5)</option>
			<option value="B">B (4)</option>
			<option value="C">C (3)</option>
			<option value="D">D (2)</option>
			<option value="E">E (1)</option>
			<option value="F">F (0)</option>
		</select>
		<button onclick="addCourse(${index})">Add Course</button>
		<table id="table${index}">
			<thead>
				<tr><th>Course</th><th>Credit</th><th>Grade</th><th>Point</th><th>Remove</th></tr>
			</thead><tbody></tbody>
		</table>
		<div class="result" id="gpa${index}"></div>
	`;
	document.getElementById("semesters").appendChild(container);
	document.getElementById("semesterName").value = '';
	document.getElementById("doneBtnContainer").style.display = 'block';
}
function startAnotherSemester() {
	semesters = [];
	document.getElementById("semesters").innerHTML = "";
	document.getElementById("cgpaResult").innerText = "";
	document.getElementById("doneBtnContainer").style.display = 'none';
}
function addCourse(semIndex) {
	const name = document.getElementById(`courseName${semIndex}`).value;
	const credit = parseInt(document.getElementById(`creditUnit${semIndex}`).value);
	const grade = document.getElementById(`grade${semIndex}`).value;
	const point = gradeToPoint(grade);
	if (!name || isNaN(credit)) {
		alert("Enter valid course info.");
		return;
	}
	if (semesters[semIndex].courses.length >= 10) {
		alert("Maximum of 10 courses per semester allowed.");
		return;
	}
	semesters[semIndex].courses.push({ name, credit, grade, point });
	updateTable(semIndex);
	calculateCGPA();
	document.getElementById(`courseName${semIndex}`).value = '';
	document.getElementById(`creditUnit${semIndex}`).value = '';
}
function removeCourse(semIndex, courseIndex) {
	semesters[semIndex].courses.splice(courseIndex, 1);
	updateTable(semIndex);
	calculateCGPA();
}
function updateTable(semIndex) {
	const tbody = document.querySelector(`#table${semIndex} tbody`);
	const sem = semesters[semIndex];
	tbody.innerHTML = "";
	let totalCredit = 0, totalPoints = 0;
	sem.courses.forEach((course, i) => {
		tbody.innerHTML += `
			<tr>
				<td>${course.name}</td>
				<td>${course.credit}</td>
				<td>${course.grade}</td>
				<td>${course.point}</td>
				<td><button onclick="removeCourse(${semIndex}, ${i})">Delete</button></td>
			</tr>`;
		totalCredit += course.credit;
		totalPoints += course.point * course.credit;
	});
	const gpa = totalCredit ? (totalPoints / totalCredit).toFixed(2) : "0.00";
	document.getElementById(`gpa${semIndex}`).innerText = `Semester GPA: ${gpa}`;
}
function calculateCGPA() {
	let totalCredit = 0, totalPoints = 0;
	semesters.forEach(sem => {
		sem.courses.forEach(course => {
			totalCredit += course.credit;
			totalPoints += course.credit * course.point;
		});
	});
	const cgpa = totalCredit ? (totalPoints / totalCredit).toFixed(2) : "0.00";
	document.getElementById("cgpaResult").innerText = `Cumulative CGPA: ${cgpa}`;
}
function saveData() {
	localStorage.setItem(getUserKey(), JSON.stringify(semesters));
	alert("Data saved!");
}
function loadData() {
	const saved = localStorage.getItem(getUserKey());
	if (saved) {
		semesters = JSON.parse(saved);
		document.getElementById("semesters").innerHTML = "";
		semesters.forEach((sem, i) => {
			createSemester();
			sem.courses.forEach(() => addCourse(i));
		});
		alert("Data loaded!");
	} else {
		alert("No saved data found.");
	}
}
async function exportToPDF() {
	const { jsPDF } = window.jspdf;
	const doc = new jsPDF();
	let y = 10;
	doc.setFontSize(16);
	doc.text("GPA & CGPA Report - AUK", 10, y);
	y += 10;
	semesters.forEach(sem => {
		doc.setFontSize(14);
		doc.text(`${sem.name}`, 10, y);
		y += 6;
		doc.setFontSize(11);
		sem.courses.forEach(course => {
			doc.text(`- ${course.name} | Credit: ${course.credit}, Grade: ${course.grade}, Point: ${course.point}`, 10, y);
			y += 6;
			if (y > 280) {
				doc.addPage();
				y = 10;
			}
		});
		y += 6;
	});
	doc.setFontSize(13);
	const cgpaText = document.getElementById("cgpaResult").innerText;
	doc.text(cgpaText, 10, y);
	doc.save("cgpa_report.pdf");
}
function exportToExcel() {
	const rows = [["Semester", "Course", "Credit Unit", "Grade", "Grade Point"]];
	semesters.forEach(sem => {
		sem.courses.forEach(course => {
			rows.push([sem.name, course.name, course.credit, course.grade, course.point]);
		});
	});
	const worksheet = XLSX.utils.aoa_to_sheet(rows);
	const workbook = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(workbook, worksheet, "CGPA");
	XLSX.writeFile(workbook, "cgpa_report.xlsx");
}
function submitComment() {
	const comment = document.getElementById("userComment").value.trim();
	if (comment) {
		console.log("Comment submitted to developer:", comment);
		alert("Thanks for your comment!");
		document.getElementById("userComment").value = "";
	} else {
		alert("Please enter a comment.");
	}
}
// ...existing code... 

// On page load, auto-load user data if present
window.addEventListener("DOMContentLoaded", function() {
	loadData();
});