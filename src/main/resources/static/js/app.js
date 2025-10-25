// Global variables
let currentPage = 0;
const pageSize = 10;
let totalPages = 1;
let currentSort = 'id,asc';
let currentSearch = '';
let currentCourse = '';
let currentYear = '';

// DOM Elements
const studentsTableBody = document.getElementById('studentsTableBody');
const pagination = document.getElementById('pagination');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const courseFilter = document.getElementById('courseFilter');
const yearFilter = document.getElementById('yearFilter');
const resetFiltersBtn = document.getElementById('resetFilters');
const addStudentBtn = document.getElementById('addStudentBtn');
const studentForm = document.getElementById('studentForm');
const studentModal = new bootstrap.Modal(document.getElementById('studentModal'));
const viewStudentModal = new bootstrap.Modal(document.getElementById('viewStudentModal'));
const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const studentToDelete = document.getElementById('studentToDelete');
const toastEl = document.getElementById('toast');
const toast = new bootstrap.Toast(toastEl, { autohide: true, delay: 3000 });

// Chart instance
let courseChart;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Load students
    loadStudents();
    
    // Event Listeners
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    
    courseFilter.addEventListener('change', handleFilterChange);
    yearFilter.addEventListener('change', handleFilterChange);
    resetFiltersBtn.addEventListener('click', resetFilters);
    addStudentBtn.addEventListener('click', showAddStudentForm);
    studentForm.addEventListener('submit', handleStudentSubmit);
    confirmDeleteBtn.addEventListener('click', confirmDelete);
    
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});

// Load students from API
async function loadStudents() {
    try {
        showLoading(true);
        
        let url = `/api/students?page=${currentPage}&size=${pageSize}&sort=${currentSort}`;
        
        if (currentSearch) {
            url = `/api/students/search?name=${encodeURIComponent(currentSearch)}&page=${currentPage}&size=${pageSize}`;
        } else if (currentCourse) {
            url = `/api/students/course/${currentCourse}?page=${currentPage}&size=${pageSize}`;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch students');
        }
        
        renderStudents(data.students);
        renderPagination(data.totalPages, data.currentPage);
        totalPages = data.totalPages;
    } catch (error) {
        console.error('Error loading students:', error);
        showToast('Error', 'Failed to load students', 'danger');
    } finally {
        showLoading(false);
    }
}

// Render students in the table
function renderStudents(students) {
    studentsTableBody.innerHTML = '';
    
    // Filter students based on search term if any
    const searchTerm = currentSearch.toLowerCase();
    const filteredStudents = searchTerm 
        ? students.filter(student => 
            `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm) ||
            student.email.toLowerCase().includes(searchTerm) ||
            (student.phoneNumber && student.phoneNumber.includes(searchTerm)) ||
            student.course.toLowerCase().includes(searchTerm) ||
            student.year.toString().includes(searchTerm) ||
            student.gpa.toString().includes(searchTerm) ||
            (student.address && student.address.toLowerCase().includes(searchTerm))
        )
        : students;

    if (filteredStudents.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="8" class="text-center py-4">
                <div class="text-muted">No students found matching "${currentSearch}"</div>
            </td>
        `;
        studentsTableBody.appendChild(row);
        return;
    }
    
    filteredStudents.forEach(student => {
        const fullName = `${student.firstName} ${student.lastName}`;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.id}</td>
            <td>${highlightSearchTerm(fullName, currentSearch)}</td>
            <td>${highlightSearchTerm(student.email, currentSearch)}</td>
            <td>${student.phoneNumber ? highlightSearchTerm(student.phoneNumber, currentSearch) : '-'}</td>
            <td>${highlightSearchTerm(getCourseName(student.course), currentSearch)}</td>
            <td>${student.year}${getOrdinalSuffix(student.year)} Year</td>
            <td>${highlightSearchTerm(student.gpa.toFixed(2), currentSearch)}</td>
            <td class="text-nowrap">
                <button class="btn btn-sm btn-outline-primary me-1" onclick="viewStudent(${student.id})" data-bs-toggle="tooltip" title="View">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-secondary me-1" onclick="editStudent(${student.id})" data-bs-toggle="tooltip" title="Edit">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="showDeleteConfirmation(${student.id}, '${student.firstName} ${student.lastName.replace(/'/g, "\\'")}')" data-bs-toggle="tooltip" title="Delete">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        studentsTableBody.appendChild(row);
    });
    
    // Initialize tooltips for action buttons
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// Helper function to highlight search term in text
function highlightSearchTerm(text, searchTerm) {
    if (!searchTerm || !text) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.toString().replace(regex, '<span class="bg-warning">$1</span>');
}

// Render pagination
function renderPagination(totalPages, currentPage) {
    pagination.innerHTML = '';
    
    if (totalPages <= 1) return;
    
    // Previous button
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${currentPage === 0 ? 'disabled' : ''}`;
    prevLi.innerHTML = `
        <a class="page-link" href="#" aria-label="Previous" data-page="${currentPage - 1}">
            <span aria-hidden="true">&laquo;</span>
        </a>
    `;
    pagination.appendChild(prevLi);
    
    // Page numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }
    
    if (startPage > 0) {
        const firstPageLi = document.createElement('li');
        firstPageLi.className = 'page-item';
        firstPageLi.innerHTML = `<a class="page-link" href="#" data-page="0">1</a>`;
        pagination.appendChild(firstPageLi);
        
        if (startPage > 1) {
            const ellipsisLi = document.createElement('li');
            ellipsisLi.className = 'page-item disabled';
            ellipsisLi.innerHTML = '<span class="page-link">...</span>';
            pagination.appendChild(ellipsisLi);
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const pageLi = document.createElement('li');
        pageLi.className = `page-item ${i === currentPage ? 'active' : ''}`;
        pageLi.innerHTML = `<a class="page-link" href="#" data-page="${i}">${i + 1}</a>`;
        pagination.appendChild(pageLi);
    }
    
    if (endPage < totalPages - 1) {
        if (endPage < totalPages - 2) {
            const ellipsisLi = document.createElement('li');
            ellipsisLi.className = 'page-item disabled';
            ellipsisLi.innerHTML = '<span class="page-link">...</span>';
            pagination.appendChild(ellipsisLi);
        }
        
        const lastPageLi = document.createElement('li');
        lastPageLi.className = 'page-item';
        lastPageLi.innerHTML = `<a class="page-link" href="#" data-page="${totalPages - 1}">${totalPages}</a>`;
        pagination.appendChild(lastPageLi);
    }
    
    // Next button
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${currentPage === totalPages - 1 ? 'disabled' : ''}`;
    nextLi.innerHTML = `
        <a class="page-link" href="#" aria-label="Next" data-page="${currentPage + 1}">
            <span aria-hidden="true">&raquo;</span>
        </a>
    `;
    pagination.appendChild(nextLi);
    
    // Add event listeners to page links
    document.querySelectorAll('.page-link').forEach(link => {
        if (link.dataset.page !== undefined) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = parseInt(link.dataset.page);
                if (page >= 0 && page < totalPages && page !== currentPage) {
                    currentPage = page;
                    loadStudents();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
        }
    });
}

// Handle search
function handleSearch() {
    currentSearch = searchInput.value.trim().toLowerCase();
    currentPage = 0; // Reset to first page when searching
    loadStudents();
}

// Handle filter changes
function handleFilterChange() {
    currentCourse = courseFilter.value;
    currentYear = yearFilter.value;
    currentSearch = '';
    searchInput.value = '';
    currentPage = 0;
    
    // If year filter is set, we need to filter on the client side
    if (currentYear) {
        filterStudentsByYear();
    } else {
        loadStudents();
    }
}

// Filter students by year (client-side)
function filterStudentsByYear() {
    const rows = studentsTableBody.querySelectorAll('tr');
    let visibleCount = 0;
    
    rows.forEach(row => {
        const yearCell = row.cells[5]; // Year is the 6th cell (0-based index 5)
        if (yearCell) {
            const year = yearCell.textContent.trim().replace('Year ', '');
            if (year === currentYear || !currentYear) {
                row.style.display = '';
                visibleCount++;
            } else {
                row.style.display = 'none';
            }
        }
    });
    
    // Show "No students found" message if no rows are visible
    const noResultsRow = studentsTableBody.querySelector('.no-results');
    if (visibleCount === 0 && !noResultsRow) {
        const row = document.createElement('tr');
        row.className = 'no-results';
        row.innerHTML = `
            <td colspan="8" class="text-center py-4">No students found matching the selected filters</td>
        `;
        studentsTableBody.appendChild(row);
    } else if (noResultsRow && visibleCount > 0) {
        noResultsRow.remove();
    }
}

// Reset all filters
function resetFilters() {
    currentSearch = '';
    currentCourse = '';
    currentYear = '';
    searchInput.value = '';
    courseFilter.value = '';
    yearFilter.value = '';
    currentPage = 0;
    loadStudents();
}

// Show add student form
function showAddStudentForm() {
    document.getElementById('modalTitle').textContent = 'Add New Student';
    document.getElementById('studentForm').reset();
    document.getElementById('studentId').value = '';
    studentModal.show();
}

// View student details
async function viewStudent(id) {
    try {
        showLoading(true);
        const response = await fetch(`/api/students/${id}`);
        const student = await response.json();
        
        if (!response.ok) {
            throw new Error(student.message || 'Failed to fetch student');
        }
        
        const studentDetails = document.getElementById('studentDetails');
        const enrollmentDate = new Date(student.enrollmentDate).toLocaleDateString();
        
        studentDetails.innerHTML = `
            <div class="row mb-3">
                <div class="col-md-4 fw-bold">Name:</div>
                <div class="col-md-8">${student.firstName} ${student.lastName}</div>
            </div>
            <div class="row mb-3">
                <div class="col-md-4 fw-bold">Email:</div>
                <div class="col-md-8">${student.email}</div>
            </div>
            <div class="row mb-3">
                <div class="col-md-4 fw-bold">Phone:</div>
                <div class="col-md-8">${student.phoneNumber || '-'}</div>
            </div>
            <div class="row mb-3">
                <div class="col-md-4 fw-bold">Course:</div>
                <div class="col-md-8">${getCourseName(student.course)}</div>
            </div>
            <div class="row mb-3">
                <div class="col-md-4 fw-bold">Year:</div>
                <div class="col-md-8">Year ${student.year}</div>
            </div>
            <div class="row mb-3">
                <div class="col-md-4 fw-bold">GPA:</div>
                <div class="col-md-8">
                    <span class="badge ${student.gpa >= 8 ? 'bg-success' : student.gpa >= 6 ? 'bg-warning text-dark' : 'bg-danger'}">
                        ${student.gpa.toFixed(1)}
                    </span>
                </div>
            </div>
            <div class="row mb-3">
                <div class="col-md-4 fw-bold">Enrollment Date:</div>
                <div class="col-md-8">${enrollmentDate}</div>
            </div>
            <div class="row">
                <div class="col-md-4 fw-bold">Address:</div>
                <div class="col-md-8">${student.address || '-'}</div>
            </div>
        `;
        
        viewStudentModal.show();
    } catch (error) {
        console.error('Error viewing student:', error);
        showToast('Error', 'Failed to load student details', 'danger');
    } finally {
        showLoading(false);
    }
}

// Edit student
async function editStudent(id) {
    try {
        showLoading(true);
        const response = await fetch(`/api/students/${id}`);
        const student = await response.json();
        
        if (!response.ok) {
            throw new Error(student.message || 'Failed to fetch student');
        }
        
        document.getElementById('modalTitle').textContent = 'Edit Student';
        document.getElementById('studentId').value = student.id;
        document.getElementById('firstName').value = student.firstName;
        document.getElementById('lastName').value = student.lastName;
        document.getElementById('email').value = student.email;
        document.getElementById('phoneNumber').value = student.phoneNumber || '';
        document.getElementById('course').value = student.course;
        document.getElementById('year').value = student.year;
        document.getElementById('gpa').value = student.gpa;
        document.getElementById('address').value = student.address || '';
        
        studentModal.show();
    } catch (error) {
        console.error('Error editing student:', error);
        showToast('Error', 'Failed to load student for editing', 'danger');
    } finally {
        showLoading(false);
    }
}

// Handle form submission
async function handleStudentSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const saveBtn = form.querySelector('button[type="submit"]');
    const spinner = saveBtn.querySelector('.spinner-border');
    
    // Validate form
    if (!form.checkValidity()) {
        e.stopPropagation();
        form.classList.add('was-validated');
        return;
    }
    
    // Prepare student data
    const student = {
        firstName: document.getElementById('firstName').value.trim(),
        lastName: document.getElementById('lastName').value.trim(),
        email: document.getElementById('email').value.trim(),
        phoneNumber: document.getElementById('phoneNumber').value.trim() || null,
        course: document.getElementById('course').value,
        year: parseInt(document.getElementById('year').value),
        gpa: parseFloat(document.getElementById('gpa').value),
        address: document.getElementById('address').value.trim() || null
    };
    
    const studentId = document.getElementById('studentId').value;
    const isEdit = !!studentId;
    
    try {
        // Show loading state
        saveBtn.disabled = true;
        spinner.classList.remove('d-none');
        
        let response;
        let method;
        let url = '/api/students';
        
        if (isEdit) {
            method = 'PUT';
            url += `/${studentId}`;
        } else {
            method = 'POST';
        }
        
        response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(student)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to save student');
        }
        
        // Show success message
        showToast('Success', `Student ${isEdit ? 'updated' : 'added'} successfully`, 'success');
        
        // Reset form and close modal
        form.reset();
        form.classList.remove('was-validated');
        studentModal.hide();
        
        // Reload students
        loadStudents();
        loadStatistics();
    } catch (error) {
        console.error('Error saving student:', error);
        showToast('Error', error.message || 'Failed to save student', 'danger');
    } finally {
        // Reset button state
        saveBtn.disabled = false;
        spinner.classList.add('d-none');
    }
}

// Show delete confirmation
function showDeleteConfirmation(id, name) {
    studentToDelete.textContent = name;
    confirmDeleteBtn.dataset.id = id;
    deleteModal.show();
}

// Confirm delete
async function confirmDelete() {
    const id = confirmDeleteBtn.dataset.id;
    
    try {
        showLoading(true);
        const response = await fetch(`/api/students/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Failed to delete student');
        }
        
        // Show success message
        showToast('Success', 'Student deleted successfully', 'success');
        
        // Close modal
        deleteModal.hide();
        
        // Reload students
        loadStudents();
    } catch (error) {
        console.error('Error deleting student:', error);
        showToast('Error', error.message || 'Failed to delete student', 'danger');
    } finally {
        showLoading(false);
    }
}

// Show toast notification
function showToast(title, message, type = 'info') {
    const toastTitle = document.getElementById('toastTitle');
    const toastMessage = document.getElementById('toastMessage');
    
    // Set toast content
    toastTitle.textContent = title;
    toastMessage.textContent = message;
    
    // Set toast color based on type
    const toast = document.querySelector('.toast');
    toast.className = `toast ${type}`;
    
    // Show toast
    bootstrap.Toast.getOrCreateInstance(toastEl).show();
}

// Show/hide loading state
function showLoading(show) {
    const mainContent = document.querySelector('.container-fluid');
    if (show) {
        mainContent.classList.add('loading');
    } else {
        mainContent.classList.remove('loading');
    }
}

// Helper function to get course name from code
function getCourseName(courseCode) {
    const courses = {
        'CS': 'Computer Science',
        'IT': 'Information Technology',
        'ECE': 'Electronics and Communication',
        'EEE': 'Electrical and Electronics',
        'MECH': 'Mechanical',
        'CIVIL': 'Civil'
    };
    return courses[courseCode] || courseCode;
}
