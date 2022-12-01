const express = require("express");
const bodyParser = require("body-parser");
// const date = require(__dirname+ "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

mongoose.connect("mongodb+srv://mdshaibaz:.dQqXwf-gHt-P4-@cluster0.nlxlzvf.mongodb.net/todlistDB",{useNewUrlParser: true});

// const items = ["Eat", "Study", "Drink"];
 //const workItems = [];

const itemSchema = {
  name: String
};

const Item = mongoose.model("Item",itemSchema);

app.use(bodyParser.urlencoded({
  extended: true
}));

const item1 = new Item({
  name: "Bath",
});

const item2 = new Item({
  name: "Jogging",
});

const item3 = new Item({
  name: "Gym",
});



const defaultItems = [item1,item2,item3];

const listSchmea = {
  name: String,
  items: [itemSchema]
};


const List = mongoose.model("List",listSchmea);



app.use(express.static("public"));

app.set('view engine', 'ejs');

app.get("/", function(req, res) {
  // day = date.getDate();

  Item.find({},function(err, foundItems){
    if(foundItems.length === 0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log("Deal with the error");
        }else{
          console.log("added the items");
        }
      });
      res.redirect("/");
    }else{
    res.render("list", {listTitle: "Today",nitem: foundItems  });
  }
  })

  })

  app.get("/:customListName",function(req,res){
      const customListName = _.capitalize(req.params.customListName);
    List.findOne({name: customListName}, function(err,foundList){
      if(!err){
        if(!foundList){
          //create a new list
          const list = new List({
            name: customListName,
            items: defaultItems
          });
            list.save();
            res.redirect("/" + customListName);
        //console.log("Doesnt exist!");
      }else{
        //show existing list;
        //console.log("exist");
        res.render("list", {listTitle: foundList.name, nitem: foundList.items});
      }
    }
    })

  })

app.post("/", function(req, res) {
  console.log(req.body);
  const itemName = req.body.newItem;
  const listName = req.body.list;
  console.log(listName);

  const item = new Item({
    name: itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName}, function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+ listName);
    })
  }


  //
  // if(req.body.list === "Work" ){
  //   workItems.push(item);
  //   res.redirect("/work");
  // }else{
  //   items.push(item);
  //   res.redirect("/");
  // }
  //console.log(req.body.newItem);
})

app.post("/delete",function(req,res){
  const checkedId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedId,function(err){
      if(err){
        console.log(err);
      }else{
        console.log("succes fully delted...");
      }
    })
}else{
  List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedId}}}, function(err,findList){
    if(!err){
      res.redirect("/" + listName);
    }
  });

}

  console.log(checkedId);
});

// app.get("/work", function(req, res) {
//   res.render("list", {
//     listTitle: "Work List",
//     nitem: workItems
//   });
// });
app.get("/about",function(req,res){
  res.render("about");
});
//
// app.post("/work", function(req, res) {
//   let item = req.body.newItem;
//   workItems.push(item);
//   res.redirect("/work");
// });

let port = process.env.PORT;
if(port == null || port ==""){
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
})
