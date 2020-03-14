const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const graphqlHttp = require("express-graphql");
const { buildSchema } = require("graphql");
const mongoose = require("mongoose");

const Event = require("./models/event");
const User = require("./models/user");

const user = userID => {
  return User.findById(userID)
    .then(user => {
      return {
        ...user._doc,
        _id: user.id,
        createdEvents: events.bind(this, user._doc.createdEvents)
      };
    })
    .catch(err => {
      throw err;
    });
};

const events = eventIds => {
  return Event.find({ _id: { $in: eventIds } })
    .then(events => {
      return events.map(event => {
        return {
          ...event._doc,
          _id: event.id,
          creator: user.bind(this, event.creator)
        };
      });
    })
    .catch(err => {
      throw err;
    });
};
const app = express();

app.use(bodyParser.json());

app.use(
  "/graphql",
  graphqlHttp({
    schema: buildSchema(`
      type Event {
        _id: ID!
        title: String!
        description: String!
        price: Float!
        date: String!
        creator: User!
      }
      type User {
        _id: ID!
        email: String!
        password: String
        createdEvents: [Event!]

      }

      input EventInput {
        title: String!
        description: String!
        price: Float!
        date: String!
      }

      input UserInput {
        email: String!
        password: String!
      }

      type RootQuery {
        events: [Event!]!
      }

      type RootMutation {
        createEvent(eventInput: EventInput): Event
        createUser(userInput: UserInput): User
      }
    
      schema {
        query: RootQuery 
        mutation: RootMutation
      }
    `),
    rootValue: {
      events: () => {
        return Event.find().then(events => {
          return events.map(event => {
            return {
              ...event._doc,
              _id: event.id,
              creator: user.bind(this, event._doc.creator.id)
            };
          });
        });
      },
      createEvent: args => {
        const event = new Event({
          title: args.eventInput.title,
          description: args.eventInput.description,
          price: +args.eventInput.price,
          date: new Date(args.eventInput.date)
        });

        return event
          .save()
          .then(res => {
            return { ...res._doc, _id: event._doc._id.toString() };
          })
          .catch(err => console.log(err));
      },
      createUser: args => {
        return bcrypt
          .hash(args.userInput.password, 12)
          .then(hashedPassword => {
            const user = new User({
              email: args.userInput.email,
              password: hashedPassword
            });

            return user.save();
          })
          .then(result => {
            return { ...result._doc, _id: result.id };
          })
          .catch(err => {
            throw err;
          });
      }
    },
    graphiql: true
  })
);

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-pbskw.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(3000);
    console.log("Listening on port 3000");
  })
  .catch(err => {
    console.log(err);
  });
