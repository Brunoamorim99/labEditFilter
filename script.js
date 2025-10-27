document.addEventListener('DOMContentLoaded', () => {
    const bookForm = document.getElementById('book-form');
    const bookList = document.querySelector('.book-list');
    const filterSelect = document.getElementById('filter');
    let books = JSON.parse(localStorage.getItem('books')) || [];
    let editingIndex = null;

    // Function to render books
    function renderBooks() {
        bookList.innerHTML = '';
        const filteredBooks = books.filter(book => {
            return filterSelect.value === 'all' || book.publisher === filterSelect.value;
        });
        filteredBooks.forEach((book, index) => {
            const bookItem = document.createElement('div');
            bookItem.className = 'book-item';
            bookItem.innerHTML = `
                <h3>${book.title}</h3>
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
            books.splice(index, 1);
            saveBooks();
            renderBooks();
        }
    });

    // Filter change
    filterSelect.addEventListener('change', renderBooks);

    // Initial render
    renderBooks();
});