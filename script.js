document.addEventListener('DOMContentLoaded', () => {
    const bookForm = document.getElementById('book-form');
    const bookList = document.querySelector('.book-list');
    const filterSelect = document.getElementById('filter');
    let books = JSON.parse(localStorage.getItem('books')) || [];
    let loans = JSON.parse(localStorage.getItem('loans')) || [];
    let currentView = 'books'; // 'books' or 'loans'
    let editingIndex = null;

    // Function to render books
    function renderBooks() {
        bookList.innerHTML = '';
        const filteredBooks = books.filter(book => {
            return filterSelect.value === 'all' || book.publisher === filterSelect.value;
        });
        filteredBooks.forEach((book, index) => {
            const isOnLoan = loans.some(loan => loan.bookIndex === index);
            const bookItem = document.createElement('div');
            bookItem.className = `book-item ${isOnLoan ? 'on-loan' : ''}`;
            bookItem.innerHTML = `
                <h3>${book.title} ${isOnLoan ? '(On Loan)' : ''}</h3>
                <p>Author: ${book.author}</p>
                <p>Publisher: ${book.publisher}</p>
                <p>Language: ${book.language}</p>
                <p>ISBN: ${book.isbn}</p>
                <div class="book-actions">
                    <button class="btn-edit" data-index="${index}">EDIT</button>
                    <button class="btn-delete" data-index="${index}">DELETE</button>
                </div>
            `;
            bookList.appendChild(bookItem);
        });
        updateFilterOptions();
    }

    // Function to update filter options
    function updateFilterOptions() {
        const publishers = [...new Set(books.map(book => book.publisher))];
        filterSelect.innerHTML = '<option value="all">All</option>';
        publishers.forEach(publisher => {
            filterSelect.innerHTML += `<option value="${publisher}">${publisher}</option>`;
        });
        filterSelect.value = 'all';
    }

    // Function to save books to localStorage
    function saveBooks() {
        localStorage.setItem('books', JSON.stringify(books));
    }

    // Function to save loans to localStorage
    function saveLoans() {
        localStorage.setItem('loans', JSON.stringify(loans));
    }

    // Function to render loan form
    function renderLoanForm() {
        const bookSelect = document.getElementById('book-select');
        bookSelect.innerHTML = '<option value="">Select a book</option>';
        const availableBooks = books.filter((book, index) => !loans.some(loan => loan.bookIndex === index));
        availableBooks.forEach((book, index) => {
            const option = document.createElement('option');
            option.value = books.indexOf(book);
            option.textContent = book.title;
            bookSelect.appendChild(option);
        });

        const loanFormSection = document.querySelector('.add-loan');
        if (availableBooks.length === 0) {
            loanFormSection.innerHTML = '<p>All books have been loaned out.</p>';
        } else {
            loanFormSection.innerHTML = `
                <h2>Create Book Loan</h2>
                <form id="loan-form">
                    <input type="text" id="borrower" placeholder="Borrower Name" required>
                    <select id="book-select" required>
                        <option value="">Select a book</option>
                    </select>
                    <input type="number" id="loan-period" placeholder="Loan period (1-4 weeks)" min="1" max="4" required>
                    <button type="submit">Create Loan</button>
                </form>
            `;
            // Re-populate select after recreating form
            const newBookSelect = document.getElementById('book-select');
            availableBooks.forEach((book, index) => {
                const option = document.createElement('option');
                option.value = books.indexOf(book);
                option.textContent = book.title;
                newBookSelect.appendChild(option);
            });
        }
    }

    // Function to render loaned books
    function renderLoanedBooks() {
        const loanList = document.querySelector('.loan-list');
        loanList.innerHTML = '';
        loans.forEach((loan, index) => {
            const book = books[loan.bookIndex];
            const dueDate = new Date(loan.dueDate).toLocaleDateString();
            const loanItem = document.createElement('div');
            loanItem.className = 'loan-item';
            loanItem.innerHTML = `
                <p><strong>Borrower:</strong> ${loan.borrower}</p>
                <p><strong>Book:</strong> ${book.title}</p>
                <p><strong>Due Date:</strong> ${dueDate}</p>
            `;
            loanList.appendChild(loanItem);
        });
    }

    // Function to switch views
    function switchView(view) {
        const booksView = document.getElementById('books-view');
        const loansView = document.getElementById('loans-view');
        const viewBooksBtn = document.getElementById('view-books-btn');
        const viewLoansBtn = document.getElementById('view-loans-btn');

        currentView = view;
        if (view === 'books') {
            booksView.style.display = 'block';
            loansView.style.display = 'none';
            viewBooksBtn.style.backgroundColor = '#45a049';
            viewLoansBtn.style.backgroundColor = '#4CAF50';
        } else {
            booksView.style.display = 'none';
            loansView.style.display = 'block';
            viewBooksBtn.style.backgroundColor = '#4CAF50';
            viewLoansBtn.style.backgroundColor = '#45a049';
            renderLoanForm();
            renderLoanedBooks();
        }
    }

    // Add or update book
    bookForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('title').value;
        const author = document.getElementById('author').value;
        const publisher = document.getElementById('publisher').value;
        const language = document.getElementById('language').value;
        const isbn = document.getElementById('isbn').value;

        if (editingIndex !== null) {
            books[editingIndex] = { title, author, publisher, language, isbn };
            editingIndex = null;
            bookForm.querySelector('button').textContent = 'Add Book';
        } else {
            books.push({ title, author, publisher, language, isbn });
        }
        saveBooks();
        bookForm.reset();
        renderBooks();
        if (currentView === 'loans') {
            renderLoanForm();
        }
    });

    // Handle edit and delete
    bookList.addEventListener('click', (e) => {
        const index = e.target.getAttribute('data-index');
        if (e.target.classList.contains('btn-edit')) {
            const book = books[index];
            document.getElementById('title').value = book.title;
            document.getElementById('author').value = book.author;
            document.getElementById('publisher').value = book.publisher;
            document.getElementById('language').value = book.language;
            document.getElementById('isbn').value = book.isbn;
            editingIndex = index;
            bookForm.querySelector('button').textContent = 'Update Book';
        } else if (e.target.classList.contains('btn-delete')) {
            // Check if book is on loan before deleting
            const isOnLoan = loans.some(loan => loan.bookIndex === parseInt(index));
            if (isOnLoan) {
                alert('Cannot delete a book that is currently on loan.');
                return;
            }
            books.splice(index, 1);
            // Update loan indices after deletion
            loans.forEach(loan => {
                if (loan.bookIndex > parseInt(index)) {
                    loan.bookIndex--;
                }
            });
            saveBooks();
            saveLoans();
            renderBooks();
            if (currentView === 'loans') {
                renderLoanForm();
            }
        }
    });

    // Filter change
    filterSelect.addEventListener('change', renderBooks);

    // View switching buttons
    document.getElementById('view-books-btn').addEventListener('click', () => switchView('books'));
    document.getElementById('view-loans-btn').addEventListener('click', () => switchView('loans'));

    // Loan form submission
    document.addEventListener('submit', (e) => {
        if (e.target.id === 'loan-form') {
            e.preventDefault();
            const borrower = document.getElementById('borrower').value;
            const bookIndex = parseInt(document.getElementById('book-select').value);
            const loanPeriod = parseInt(document.getElementById('loan-period').value);

            if (bookIndex < 0 || bookIndex >= books.length) {
                alert('Invalid book selection.');
                return;
            }

            // Check if book is already on loan
            const alreadyLoaned = loans.some(loan => loan.bookIndex === bookIndex);
            if (alreadyLoaned) {
                alert('This book is already on loan.');
                return;
            }

            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + (loanPeriod * 7));

            loans.push({ borrower, bookIndex, dueDate: dueDate.toISOString() });
            saveLoans();
            renderBooks();
            renderLoanForm();
            renderLoanedBooks();
            document.getElementById('loan-form').reset();
        }
    });

    // Initial render
    renderBooks();
});