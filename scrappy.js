var websiteData;
Scrappy = new Mongo.Collection('scrappy');
Recipes = new Mongo.Collection('recipes');
RecipesBoth = new Mongo.Collection('recipesBoth');
Ingredients = new Mongo.Collection('ingredients');
Steps = new Mongo.Collection('steps');

if (Meteor.isClient) {
  // counter starts at 0
  
  Session.setDefault('counter', 0);

  Template.hello.helpers({
    counter: function () {
      return Session.get('counter');
    }
  });

  Template.hello.events({
    'click button.clickme': function (event) {
      // increment the counter when button is clicked
      Session.set('counter', Session.get('counter') + 1);
       console.log(Session.get('recets'))
    },

    'click button': function (event) {
      var attr = event.target.attributes;
       Meteor.call(attr.function.value+'_'+attr.url.value, function (error, result) {
          if(error){
            alert('La funcion "'+attr.function.value+'_'+attr.url.value+'" no ha sido encontrada');
            console.log("error",error);
          }
          console.log(result);
        });
      }
  });

}
 
if (Meteor.isServer) {
  Meteor.startup(function () {

    var cheerio = Meteor.npmRequire('cheerio');

    Meteor.methods({
        getData: function(){
          result = '';          
          return result;
        },
        getData_test: function(){
          result = Meteor.http.get("https://www.edamam.com/recipe/spaghetti-with-lemon-and-olive-oil-75a65c7dd271e851a406c8464ba590e9/-/vegetarian");
          $ = cheerio.load(result.content);
          // titulo
          var resp = $('#recipe-ingredients > span').text();
          // ingredientes
          resp += $('#recipe-ingredients > ul').text();
          
          return resp;
        },
        getUrl_edamam: function(){
          
          result = Meteor.http.get("http://www.promueva.cl/edamam.txt");
          $ = cheerio.load(result.content);
          var frm = $('#search-results > .meals-list > .ul > ul > li > .box > .inner > .object > a');
          var img = $('#search-results > .meals-list > .ul > ul > li > .box > .inner > .object > a > span > span > img');

          for (i=0;i<frm.length;i++)
            {
              console.log($(frm[i]).attr('href')+'\n'+$(frm[i]).text().trim());
              Scrappy.insert({
                  "website": "edamam",
                  "url":"https://www.edamam.com"+$(frm[i]).attr('href').trim(),
                  "count": i
                });
            }

          return Scrappy.find().fetch();
        },
        getIngredients_edamam: function(){
          
          var topPosts = Scrappy.find({});
          var count = 0;
          topPosts.forEach(function (post) {
           
            result = Meteor.http.get(post.url);
            $ = cheerio.load(result.content);

            var img = $('div#recipe-image > img.block');
            var pre = $('div#recipe-preparation.cf > a').attr('href').trim();
            var ing = $('div#recipe-ingredients > span.ttl').text().trim();
            var ingre = $('div#recipe-ingredients > ul > li');
            var cred = $('div#recipe-preparation.cf > a > img');


            Recipes.insert({
                "website": "edamam",
                "name": $(img).attr('alt').trim(),
                "img": $(img).attr('src').trim(),
                "preparation": pre,
                "ingredients": ing,
                "creditsTo": $(cred).attr('alt'),
                "creditsImg": $(cred).attr('src'),
                "count": count
            });

            for (i=0;i<ingre.length;i++)
            {
              quantity = "";ingredient = "";

              var n = $(ingre[i]).text().indexOf(" ");
                if(isNaN($(ingre[i]).text().substring(0,1))==false){
                    quantity = $(ingre[i]).text().substring(0,n).trim();
                    ingredient = $(ingre[i]).text().substring(n).trim();
                }else{
                    quantity = "";
                    ingredient = $(ingre[i]).text().trim();
                }

              Ingredients.insert({
              "website": "edamam",
              "count": count,
              "quantity": quantity,
              "ingredient": ingredient,
              "phrase" : $(ingre[i]).text().trim(),
              "order": i
              });
            }

            count += 1;
          });
        },
        getBoth_edamam: function(){        

          RecipesBoth.remove({});
          
          var topPosts = Scrappy.find({});
          var count = 1;
          topPosts.forEach(function (post) {
           
            result = Meteor.http.get(post.url);
            $ = cheerio.load(result.content);

            var img = $('div#recipe-image > img.block');
            var pre = $('div#recipe-preparation.cf > a').attr('href').trim();
            var ing = $('div#recipe-ingredients > span.ttl').text().trim();
            var ingre = $('div#recipe-ingredients > ul > li');
            var cred = $('div#recipe-preparation.cf > a > img');
            var ser = $('#serv.txt.num').val()

            var ingredien = [];

            
            for (i=0;i<ingre.length;i++)
            {
              quantity = "";ingredient = "";

              var n = $(ingre[i]).text().indexOf(" ");
                if(isNaN($(ingre[i]).text().substring(0,1))==false){
                    quantity = $(ingre[i]).text().substring(0,n).trim();
                    ingredient = $(ingre[i]).text().substring(n).trim();
                }else{
                    quantity = "";
                    ingredient = $(ingre[i]).text().trim();
                }

              ingredien.push({
              "quantity": quantity,
              "ingredient": ingredient,
              "order": i
              });
            }

            RecipesBoth.insert({
                "website": "edamam",
                "url": post.url,
                "name": $(img).attr('alt').trim(),
                "img": $(img).attr('src').trim(),
                "preparation": pre,
                "serving" : ser,
                "ingredients": ingredien,
                "creditsTo": $(cred).attr('alt'),
                "creditsImg": $(cred).attr('src'),
                "count": count

            });


            count += 1;
          });
        },
        getUrl_funcook: function(){
          console.log('work it!');
          return 'wuork';
          /*
          result = Meteor.http.get("http://www.promueva.cl/funcook.html");
          $ = cheerio.load(result.content);
          var frm = $('#search-results > .meals-list > .ul > ul > li > .box > .inner > .object > a');
          var img = $('#search-results > .meals-list > .ul > ul > li > .box > .inner > .object > a > span > span > img');

          for (i=0;i<frm.length;i++)
            {
              console.log($(frm[i]).attr('href')+'\n'+$(frm[i]).text().trim());
              Scrappy.insert({
                  "url":"https://www.edamam.com"+$(frm[i]).attr('href').trim(),
                  "count": i
                });
            }

          return Scrappy.find().fetch();
          */
        }        

    })

  });
}
