// Book class
class Book {
  constructor(id, title, coverURL, rating) {
    this.id = id;
    this.title = title;
    this.coverURL = coverURL;
    this.rating = rating;
  }
}

// UI class
class UI {
  constructor() {
    this.books = [];
    this.newBookId = 0;
    this.entryText = document.getElementById('entry-text');
    this.bookList = document.getElementById('book-list');
    this.modals = document.querySelectorAll('.modal');
    this.addBookModal = document.getElementById('addBook-modal');
    this.deleteBookModal = document.getElementById('deleteBook-modal');
    this.backdrop = document.getElementById('backdrop');
    this.userInputs = this.addBookModal.querySelectorAll('input');
    this.addBookBtn = document.getElementById('addBook-btn');
    this.confirmAddBookBtn = document.getElementById('addBook-confirmBtn');
    this.cancelAddBookBtn = document.getElementById('addBook-cancelBtn');

    // Event Listeners
    document.addEventListener('DOMContentLoaded', this.setUI);
    this.addBookBtn.addEventListener(
      'click',
      this.toggleModal.bind(null, this.addBookModal)
    );
    this.backdrop.addEventListener('click', this.backdropClickHandler);
    this.confirmAddBookBtn.addEventListener('click', this.addBookHandler);
    this.cancelAddBookBtn.addEventListener('click', this.cancelAddBookHandler);
  }

  setUI = () => {
    this.books = Store.getBooks();
    for (const book of this.books) {
      this.renderNewBookElement(book);
    }
    this.handleEntryText();

    if (!this.books[this.books.length - 1]) {
      this.newBookId = 0;
    } else {
      this.newBookId = this.books[this.books.length - 1].id + 1;
    }
  };

  handleEntryText = () => {
    if (this.books.length === 0) {
      this.entryText.style.display = 'block';
    } else {
      this.entryText.style.display = 'none';
    }
  };

  showAlert = (msg, type) => {
    const alertElement = document.createElement('div');
    alertElement.className = `alert alert--${type}`;
    alertElement.append(document.createTextNode(msg));

    const header = document.querySelector('header');
    header.insertAdjacentElement('afterend', alertElement);

    setTimeout(() => {
      document.querySelector('.alert').remove();
    }, 2000);
  };

  toggleBackdrop = () => {
    this.backdrop.classList.toggle('visible');
  };

  toggleModal = modalName => {
    modalName.classList.toggle('visible');
    this.toggleBackdrop();
  };

  backdropClickHandler = () => {
    for (const modal of this.modals) {
      if (modal.classList.contains('visible')) {
        this.toggleModal.call(null, modal);
      }
    }
    this.clearBookInputs();
  };

  clearBookInputs = () => {
    for (const input of this.userInputs) {
      input.value = '';
    }
  };

  deleteBook = bookId => {
    let bookIndex = this.books.findIndex(book => book.id === bookId);
    this.bookList.children[bookIndex].remove();
    this.books = this.books.filter(book => book.id !== bookId);
    Store.removeBook(bookId);
    this.showAlert('Book was successfully removed from your list!', 'success');
    this.toggleModal.call(null, this.deleteBookModal);
    this.handleEntryText();
  };

  deleteBookHandler = bookId => {
    this.toggleModal.call(null, this.deleteBookModal);
    let cancelBtn = this.deleteBookModal.querySelector('.btn--passive');
    let confirmBtn = this.deleteBookModal.querySelector('.btn--danger');

    cancelBtn.replaceWith(cancelBtn.cloneNode(true));
    confirmBtn.replaceWith(confirmBtn.cloneNode(true));

    cancelBtn = this.deleteBookModal.querySelector('.btn--passive');
    confirmBtn = this.deleteBookModal.querySelector('.btn--danger');

    cancelBtn.addEventListener(
      'click',
      this.toggleModal.bind(null, this.deleteBookModal)
    );
    confirmBtn.addEventListener('click', this.deleteBook.bind(null, bookId));
  };

  renderNewBookElement = bookObj => {
    const newBookElement = document.createElement('li');
    newBookElement.classList.add('book-list__item');
    newBookElement.innerHTML = `
      <div class="book-list__image">
        <img
          class="book-list__image-content"
          src="${bookObj.coverURL}"
          alt="${bookObj.title}""
        />
      </div>
      <div class="book-list__info">
        <h2 class="book-list__info-title">${bookObj.title}</h2>
        <p class="book-list__info-rating">${bookObj.rating}/5 stars</p>
      </div>
    `;

    newBookElement.addEventListener(
      'click',
      this.deleteBookHandler.bind(null, bookObj.id)
    );
    this.bookList.append(newBookElement);
  };

  addBookHandler = () => {
    const titleValue = this.userInputs[0].value;
    const coverUrlValue = this.userInputs[1].value;
    const ratingValue = this.userInputs[2].value;

    if (
      titleValue.trim() === '' ||
      coverUrlValue.trim() === '' ||
      ratingValue.trim() === '' ||
      +ratingValue < 1 ||
      +ratingValue > 5
    ) {
      return this.showAlert(
        'Please enter valid values (rating between 1 and 5)',
        'error'
      );
    }

    const newBook = new Book(
      this.newBookId,
      titleValue,
      coverUrlValue,
      ratingValue
    );

    this.books.push(newBook);
    Store.addBook(newBook);
    this.renderNewBookElement(newBook);
    this.toggleModal.call(null, this.addBookModal);
    this.showAlert('New book was successfully added to your list!', 'success');
    this.clearBookInputs();
    this.handleEntryText();
    this.newBookId++;
  };

  cancelAddBookHandler = () => {
    this.toggleModal.call(null, this.addBookModal);
    this.clearBookInputs();
  };
}

// Local storage class
class Store {
  static getBooks = () => {
    let books;
    if (localStorage.getItem('books') === null) {
      books = [];
    } else {
      books = JSON.parse(localStorage.getItem('books'));
    }
    return books;
  };

  static displayBooks = () => {
    const books = Store.getBooks();
    ui.setBooks(books);

    for (const book of books) {
      const ui = new UI();
      ui.renderNewBookElement(book);
    }
    ui.handleEntryText();
  };

  static addBook = newBook => {
    const books = Store.getBooks();
    books.push(newBook);
    localStorage.setItem('books', JSON.stringify(books));
  };

  static removeBook = bookId => {
    let books = Store.getBooks();

    books = books.filter(book => book.id !== bookId);
    localStorage.setItem('books', JSON.stringify(books));
  };
}

const ui = new UI();
