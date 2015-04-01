'use strict';

var CatalogEvent = require('CatalogEvent'),
    Product = require('Product'),

    ProductHistoryView = require('admin/ProductHistoryView'),
    SendProductView = require('admin/SendProductView'),
    SummaryDetailsPage = require('base/SummaryDetailsPage');


SummaryDetailsPage.prototype._setContentMarkup = function () {
  var products = this._products = this.getProducts();

  products = CatalogEvent.getWithoutSuperseded(products);

  if (products.length === 1) {
    // If there is only one product display details
    this.getDetailsContent(products[0]);
    this._content.insertBefore(this._getButtons(products[0]), this._content.firstChild);
  } else {
    // there is more than one product display summary
    this.getSummaryContent(products);
  }
};


SummaryDetailsPage.prototype.getSummaryContent = function (products) {
  var product,
      summary;

  for (var i = 0; i < products.length; i++) {
    product = products[i];
    summary = this.buildSummaryMarkup(product, (!i));
    if (i === 0 && this._options.markPreferred) {
      summary.classList.add('preferred');
    } else {
      summary.classList.add('non-preferred');
    }
    // append summary section
    this._content.appendChild(summary);
  }
};

SummaryDetailsPage.prototype.buildSummaryMarkup = function (product, preferred) {
  var div = document.createElement('div'),
      el,
      summaryMarkup;

  preferred = (typeof preferred === 'undefined' ? true : preferred);

  el = document.createElement('a');
  el.className = this._options.hash + '-summary summary';
  el.setAttribute('href', this._buildHash(product));

  summaryMarkup = this._getSummaryMarkup(product);
  // Add description content
  if (typeof summaryMarkup === 'object') {
    el.appendChild(summaryMarkup);
  } else {
    el.innerHTML = summaryMarkup;
  }

  // append summary markup
  div.appendChild(el);
  // add edit/delete/trump buttons
  div.appendChild(this._getButtons(product, preferred));

  return div;
};

SummaryDetailsPage.prototype._getButtons = function (product) {
  var buttons = document.createElement('div'),
      editButton = document.createElement('button'),
      deleteButton = document.createElement('button'),
      detailsButton = document.createElement('button'),
      trumpButton;


  editButton.innerHTML = 'Edit Product';
  editButton.addEventListener('click', this._editProduct.bind(this));

  deleteButton.innerHTML = 'Delete Product';
  deleteButton.addEventListener('click', this._deleteProduct.bind(this));

  detailsButton.innerHTML = 'View Revisions';
  detailsButton.addEventListener('click', this._viewProduct.bind(this));

  trumpButton = document.createElement('button');
  trumpButton.innerHTML = 'Trump Preferred';
  trumpButton.addEventListener('click', this._trumpProduct.bind(this));

  buttons.classList.add('button-group');
  buttons.classList.add('summary-actions');
  buttons.setAttribute('data-id', product.code);
  buttons.appendChild(detailsButton);
  buttons.appendChild(editButton);
  buttons.appendChild(trumpButton); 
  buttons.appendChild(deleteButton);

  return buttons;
};

SummaryDetailsPage.prototype._deleteProduct = function (e) {
  var dataid = e.target.parentElement.getAttribute('data-id'),
      productTypes = this._options.productTypes,
      productType,
      product,
      properties,
      deleteProducts = [];

  for(var i = 0; i < productTypes.length; i++) {
    productType = productTypes[i];

    product = this._getProductFromDataId(dataid, productType);

    if (product) {
      properties = product.properties;

      // build array of delete products
      deleteProducts.push(
        Product({
          source: product.source,
          type: product.type,
          status: Product.STATUS_DELETE,
          code: product.code,
          properties: {
            eventSource: properties.eventsource,
            eventSourceCode: properties.eventsourcecode
          }
        })
      );
    }
  }

  console.log(deleteProducts);

  /* Eric is updating SendProductView to accept multiple products */
  //this._sendProduct(deleteProducts);
};

SummaryDetailsPage.prototype._editProduct = function (e) {
  console.log('edit product');
  console.log(e.target.parentElement.getAttribute('data-id'));
};

SummaryDetailsPage.prototype._viewProduct = function (e) {
  var dataid = e.target.parentElement.getAttribute('data-id'),
      products = [],
      product = null,
      productTypes = this._options.productTypes;

  for (var i = 0; i < productTypes.length; i++) {
    product = this._getProductFromDataId(dataid, productTypes[i]);
    products.push({
      'source': product.source,
      'type': product.type,
      'code': product.code
    });
  }


  ProductHistoryView({
    'eventDetails': this._event,
    'products': products
  });
};

SummaryDetailsPage.prototype._trumpProduct = function (e) {
  console.log('trump product');
  console.log(e.target.parentElement.getAttribute('data-id'));
};

SummaryDetailsPage.prototype._getProductFromDataId = function (dataid, type) {
  var products = [],
      product = null;

  products = CatalogEvent.getWithoutSuperseded(
      CatalogEvent.productMapToList(
      this._options.eventDetails.properties.products));

  for (var i =0; i < products.length; i++) {
    product = products[i];
    if (type === product.type && dataid === product.code) {
      return product;
    }
  }
};

SummaryDetailsPage.prototype._sendProduct = function (products) {
  // send product
  var sendProductView,
      productSent;

  sendProductView = SendProductView({
    products: products,
    formatProduct: function (products) {
      // format product being sent
      return sendProductView.formatProduct(products);
    }
  });
  sendProductView.on('success', function () {
    // track that product was sent
    productSent = true;
  });
  sendProductView.on('cancel', function () {
    if (productSent) {
      // product was sent, which will modify the event
      // reload page to see update
      window.location.reload();
    } else {
      // product not sent, cleanup
      products = null;
      sendProductView.destroy();
      sendProductView = null;
    }
  });
  sendProductView.show();
};

module.exports = SummaryDetailsPage;