<template>
  <div id="app">
    <div class="container">
      <h2>Emoji Trivi-ai!</h2>
      <hr>
      <select  class="form-control" @change="getNewTrivia()" v-model="selectedCategory">
        <option value="" disabled selected>Choose a trivia category</option>
        <option v-for="category in categories" :value="category.value" :key="category.value" >{{ category.label }}</option>
      </select>
      <div class="aiBox">
        <ul v-if="question.clues">
          <li v-for="clue in question.clues" :key="clue.index">{{ clue.emoji }}</li>
        </ul>
        {{ aiResponse }}
      </div>
      <div class="userInput">
        <input type="text" class="form-control" placeholder="Enter your answer here" @keyup.enter="guess()" v-model="userInput">
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'App',
  components: {},
  data() {
    return {
      url: "http://localhost:8080",
      userInput: "",
      selectedCategory: "",
      categories: [
        { label: "Famous Actors", value: "actor" },
        { label: "Famous Actress", value: "actress" },
        { label: "Movies", value: "movie" },
        { label: "Animals", value: "animal" },
        { label: "Country", value: "country" }
      ],
      question:{},
      aiResponse:""
    };
  },
  computed: {
  },
  methods: {
    getNewTrivia() {
      this.question = {};
      this.aiResponse = "";
      const url = this.url + "/api/question?category=" + this.selectedCategory;
      axios.get(url, { timeout: 7000 }).then(response => {
        console.log(JSON.parse(response.data));
        this.question = JSON.parse(response.data);
      }).catch(error => {
        console.error(error);
      }).finally(() => {
      });
    },
    guess() {
      const url = this.url + "/api/guess?guess=" + this.userInput + "&answer=" + this.question.answer;
      axios.get(url, { timeout: 7000 }).then(response => {
        this.aiResponse = response.data;
      }).catch(error => {
        console.error(error);
      }).finally(() => {
      });
    }
  },
  mounted() {
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
.container{
  height: calc(100vh - 120px);
  border: solid 1px black;
  border-radius: 4px;
  padding:10px;
}
.aiBox{
  height: calc(100vh - 340px);
  border: solid 1px black;
  border-radius: 4px;
  margin-top: 20px;
  margin-bottom: 20px;
}
ul {

  list-style-type: none;
  margin-top:15px!important;
}
li {
  display: inline-block;
  margin-right: 15px; /* Optional: adds some space between items */
  font-size:40px;
}
</style>
