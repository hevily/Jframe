Jframe.define('Jframe.Router.Config',function(){
      var author = function () { console.log("author:author"); };
      var viewBook = function (bookId) {
          console.log("viewBook: bookId is populated: " + bookId);
      };

      var routes = {
        '/author': author,
        '/books/view/:bookId': viewBook,
        '/hello': {
          '/(\\w+)': {
            on: function (who) {
              console.log(who)
            }
          },
          '/world/?([^\/]*)\/([^\/]*)/?': function (a, b) {
              console.log(a, b);
          }
        }
      };
      return routes;
});

