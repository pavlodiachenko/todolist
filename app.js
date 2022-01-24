const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const app = express()
const _ = require('lodash')

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static('public'))
app.set('view engine', 'ejs');

mongoose.connect('mongodb+srv://demo:4862@cluster0.osrpc.mongodb.net/todolist?retryWrites=true&w=majority')

const itemsSchema = new mongoose.Schema({
  name: String
})

const Item = mongoose.model('Item', itemsSchema)

const item1 = new Item({
  name: 'make todolist'
})

const item2 = new Item({
  name: 'lorem ipsum'
})

const item3 = new Item({
  name: 'profit'
})

const defaultItems = [item1, item2, item3]

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
})
const List = mongoose.model('List', listSchema)


app.get('/', function(req, res) {

  Item.find({}, (err, foundItems) => {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, (err) => console.log(err));
      res.redirect('/')
    } else {
      res.render('list', {
        listTitle: 'Today',
        newItems: foundItems
      })
    }
  })
})

app.post('/', function(req, res) {
  const itemName = req.body.task
  const listName = req.body.list

  const item = new Item({
    name: itemName
  })

  if (listName === "Today") {
    item.save()
    res.redirect('/')
  } else {
    List.findOne({
      name: listName
    }, function(err, foundList) {
      foundList.items.push(item)
      foundList.save()
      res.redirect('/' + listName)
    })
  }
})

app.post('/delete', function(req, res) {
  const checkedItemID = req.body.checkbox
  const listName = req.body.listName
  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemID, function(err) {
      if (!err) {
        res.redirect('/')
      }
    })
  } else {
    List.findOneAndUpdate({
      name: listName
    }, {
      $pull: {
        items: {
          _id: checkedItemID
        }
      }
    }, function(err, foundList) {
      if (!err) {
        res.redirect('/' + listName)
      }
    })
  }
})

app.get('/:customListName', function(req, res) {
  const customListName = _.capitalize(req.params.customListName)
  List.findOne({
    name: customListName
  }, function(err, foundListItems) {

    if (!err) {
      if (foundListItems) {
        res.render('list', {
          listTitle: foundListItems.name,
          newItems: foundListItems.items
        })
      } else {
        const list = new List({
          name: customListName,
          items: defaultItems
        })
        list.save()
        res.redirect('/' + customListName)
      }
    }
  })
})


app.get('/about', function(req, res) {
  res.render('about')
})

app.listen(process.env.PORT, function() {
  console.log("listening")
})
