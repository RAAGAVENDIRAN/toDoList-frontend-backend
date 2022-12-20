//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");

const mongoose=require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser:true});

//scheam
const itemsSchema ={
  name: String,
} 
//mongoose model
const Item = mongoose.model("Item",itemsSchema);

// item document1

const item1= new Item({
  name: "welconme to your todolist"
});

// item document2

const item2= new Item({
  name: "Hit the + button to afford more"
});

// item document3

const item3= new Item({
  name: "<-- Hit this to delete an item>"
});

// putting item documant in arrar
const defaultItems = [item1,item2,item3];


const listSchema ={
  name: String,
  items : [itemsSchema]
}

const List = mongoose.model("List",listSchema);

//inserting them into our items collection



app.get("/", function(req, res) {
    //find method
    Item.find({}, function(err,foundItems){
      if(foundItems.length===0){
        Item.insertMany(defaultItems,function(err){
          if(err){
            console.log(err);
          }
          else{
            console.log("Inserted successfully dafaultitem to database");
          }
        });
        res.redirect("/"); // redirect back to the home get function. once it is added defaultitems again redirected
        //to app.get and this time else part is executed and not the if part as number of object is not 0.
       }
      else{
        res.render("list", {listTitle: "Today", newListItems: foundItems});
      }
     
    })

});

app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);     //EXPRESS ROUTE PARAMETERS

  List.findOne({name: customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        const list = new List({    //list document based on listSchema
          name: customListName,
          items: defaultItems 
      });
      list.save(); // saving into the List Collection
      res.redirect("/"+customListName); // redirecting to the current route.
    }
    else{
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
    }
  }
  });
 


   
});


app.post("/", function(req, res){

  const itemName = req.body.newItem;  // taking value of textbox in list ejs where the name is newitem
  //document for the above 
  const listName = req.body.list; // getting the listName.
  
  const item = new Item({
    name:itemName
  });

  if (listName === "Today"){ // if listNamr is today then it shoulg be processed  as usual.
    item.save(); // saving .
    res.redirect("/");

  }

  else{ // if not it comes from customlist
    // seaarch for the list document in database and add value to it.
    List.findOne({name:listName},function(err,foundList){  //found list is the customlist name
      foundList.items.push(item);  // pushing it to that custom list, where inside a list is there.
      foundList.save();
      res.redirect("/" +listName);
    });
}
  
});

app.post("/delete", function(req,res){
      const checkedItemId= req.body.checkbox;
      const listName = req.body.listName;
      if(listName==="Today"){
        Item.findByIdAndRemove(checkedItemId,function(err){ //executes only when callback[function] is there
          if(!err){
           console.log("Successfully deleted checked item"); 
           res.redirect("/");
          }

        });
    }
   else{
        //mongoose remove documant from array.
        //pull command
        List.findOneAndUpdate({name: listName},{$pull:{items: {_id:checkedItemId}}} , function(err, foundList){
            if(!err){
                res.redirect("/"+listName);
            }
          
          });    
  
  }
    
}); 

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
