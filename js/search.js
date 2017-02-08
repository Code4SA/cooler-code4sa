(function() {
  var searchBox = $('#searchbox')[0];
  var searchButton = $('#searchbutton');
  var resultsContainer = $('#search-results');

  var error = function(jqXHR, textStatus, errorThrown) {
    console.log(textStatus, errorThrown, jqXHR);
  };

  var socrataDataset = function(baseURL, apiId, moreId) {
    var id = Math.random().toString(36).substring(7);
    var container = $("<div class=\"panel panel-default\">\
    <div class=\"panel-heading\" role=\"tab\" id=\"heading" +  id + "\">\
      <h4 class=\"panel-title\">\
        <a role=\"button\" data-toggle=\"collapse\" data-parent=\"#search-results\" href=\"#collapse" +  id + "\" aria-expanded=\"false\" aria-controls=\"collapse" +  id + "\">\
          <h4 class=\"name-heading\"></h4>\
          <span class=\"result-count\">...</span> results\
        </a>\
      </h4>\
    </div>\
    <div id=\"collapse" +  id + "\" class=\"panel-collapse collapse\" role=\"tabpanel\" aria-labelledby=\"heading" +  id + "\">\
      <div class=\"panel-body dataset-results-container\"></div>\
    </div>\
  </div>");
    var nameHeading = container.find('.name-heading');
    var resultsContainer = container.find('.dataset-results-container');
    var countContainer = container.find('.result-count');
    $.ajax(baseURL + '/api/views/' + apiId + '/rows.json', {
      success: function(data) { nameHeading.append(data.meta.view.name); },
      error: function(jqXHR, textStatus, errorThrown) {
        error(jqXHR, textStatus, errorThrown);
        nameHeading.append(moreURL);
      }
    });
    var spinner = $('<img src="images/Ajax-loader.gif"></img>');
    container.append(spinner);
    var startSpinner = function() { spinner.show(); };
    var stopSpinner = function() { spinner.hide(); };
    var htmlURL = baseURL + '/' + moreId;
    var success = function(query) {
      return function(data) {
        countContainer.html(data.length);
        var searchMoreURL = htmlURL + '/data?q=' + query;
        var searchMore = "<div><a href=\"" + searchMoreURL + "\">Search more</a></div>";
        $(searchMore).appendTo(resultsContainer);
        for (i in data.slice(0,3)) {
          var rows = "";
          for (key in data[i]) {
            rows += "<tr><td>" + key + "</td><td>" + data[i][key] + "</td></tr>";
          }
          $('<div class="result"><table class="table"><tr><th>field</th><th>value</th></tr>' + rows + '</table></div>').appendTo(resultsContainer);
        };
        if (data.length > 3) {
          $('<h3>...</h3>').appendTo(resultsContainer);
        }
        resultsContainer.mark(stemmer(query), {
          separateWordSearch: true
        });
      }
    };

    return {
      container: container,
      resultsContainer: resultsContainer,
      search: search = function(query) {
        countContainer.html('...');
        startSpinner();
        $.ajax(baseURL + "/resource/" + apiId + ".json?$q=" + query, {
          error: error,
          success: success(query),
          complete: function() { stopSpinner(); }
        })
      }
    }
  }

  var datasets = [
    socrataDataset("https://data.code4sa.org", "4izb-5dt5", "Government/City-of-Cape-Town-Tender-Awards-July-Dec-2014/gxpj-akik"),
    socrataDataset("https://data.code4sa.org", "9vmn-5tnb", "Government/Tender-Awards-2015-2016/kvv2-xrvr")
  ];


  $(searchbutton).on('click', function () {
    resultsContainer.empty();
    datasets.forEach(function(dataset) {
      dataset.resultsContainer.empty();
      resultsContainer.append(dataset.container);
      dataset.search(searchBox.value);
    });
    return false;
  });

})();
