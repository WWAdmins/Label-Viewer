<template>
  <div id="app" class="container-fluid col-lg-10 offset-lg-1">

    <div class='row'>
      <div class='col-lg-6'>
        <div class='row'>
          <div class='col-lg-6'>
            <multiselect 
              id='supplierSelect'
              class='multi-select'
              v-model="supplier" 
              placeholder="select supplier"
              :options="suppliers" 
              :searchable="true" 
              :close-on-select="true"
              :select-label="''"
              :deselect-label="''"
              @select='supplierSelect'
              @remove='supplierRemove'
            >Supplier</multiselect>
          </div>
          <div class='col-lg-6'>
            <multiselect 
              class='multi-select'
              v-model="bottleType"
              placeholder="select bottle type" 
              :options="bottleTypes" 
              :searchable="true" 
              :close-on-select="true"
              :select-label="''"
              :deselect-label="''"
              @select='bottleTypeSelect'
              @remove='bottleTypeRemove'
              :disabled="!supplier"
            >Bottle type</multiselect>
          </div>
        </div>
        <div>
          <multiselect 
            class='multi-select'
            v-model="bottleId"
            placeholder="select bottle" 
            :options="bottles" 
            :searchable="true" 
            :close-on-select="true"
            :select-label="''"
            :deselect-label="''"
            @select='bottleSelect'
            @remove='bottleRemove' 
            :disabled="!bottleType"
          >Bottle</multiselect>
        </div>
        <div class="row">
          <div class='col-lg-12'>
            <button class="clear" v-if='!help' v-on:click="clearForm()">Clear all</button>
            <button class='help-button' v-if='!help' v-on:click="help = true">Help</button>
            <div class="alert alert-info alert-dismissible fade show" role="alert" v-if="help">
              <button type="close-button" class="close" data-dismiss="alert" aria-label="Close" v-on:click="help = false">
                <span aria-hidden="true">&times;</span>
              </button>
              <p class="pre-formatted help" v-html="helpMessage"></p>
            </div>
          </div>
        </div>
        <div class="row" v-if='help'>
          <div class='col-lg-12'>
            <button class="clear" v-on:click="clearForm()">Clear all</button>
          </div>
        </div>

        <div class="row">
          <div class="col-lg-6">
            <label class="header">Front labels</label>
            <!-- multi label support needed here -->
            <measurements-form
              :bottleSpec="bottleSpec"
              :globalPositions="globalPositions"
              v-if='labelStatuses.front.enabled'
              id='front-F1'
              ref="frontF1"
              side="front"
              labelId="F1"
              @invalid="emmittedInvalidLabel"
              @valid="emmittedValidLabel"
              @warning="emmitedWarningCatch"
              >
            </measurements-form>
            <label v-if="!labelStatuses.front.enabled">{{ labelStatuses.front.dissableMessage }}</label>
            <div class="alert alert-warning" role="alert" id='frontDissabledWarning' v-if="!labelStatuses.front.enabled">{{ labelStatuses.front.dissableMessage }}</div>
          </div>
          <div class="col-lg-6">
            <label class="header">Back labels</label>
            <!-- multi label support needed here -->
            <measurements-form
              :bottleSpec="bottleSpec"
              :globalPositions="globalPositions"
              v-show='labelStatuses.back.enabled'
              id='back-B1'
              ref="backB1"
              side="back"
              labelId="B1"
              @invalid="emmittedInvalidLabel"
              @valid="emmittedValidLabel"
              @warning="emmitedWarningCatch"
              >
            </measurements-form>
            <div class="alert alert-warning invalidWarning" role="alert" id='backDissabledWarning' v-if="!labelStatuses.back.enabled">{{ labelStatuses.back.dissableMessage }}</div>
          </div>
        </div>
      </div>


      <div class='col-lg-6'>
        <div class="row">
          <button id="frontDisplayButton" class="sideToggle selected" v-on:click="displaySelect('front')">Front</button>
          <button id="backDisplayButton" class="sideToggle" v-on:click="displaySelect('back')">Back</button>
        </div>
        <br>
        <div class="row">
          <div id="preview" class="col-lg-8 offset-lg-2 preview">
            <!-- Will need for loop here for multi label -->
            <div class="layer-2 labelPreview" id='labelPreview'></div>
            <div class="layer-2 labelPreview" id='labelPreviewOverflowLeft'></div>
            <div class="layer-2 labelPreview" id='labelPreviewOverflowRight'></div>
            <transition name="slide-fade">
              <img v-if="bottleType == 'Burgundy' && bottleSpec" class="image layer-1" alt="bottle sihouette" src="./assets/Bottle silhouettes/BRG_image.png">
            </transition>
            <transition name="slide-fade">
              <img v-if="bottleType == 'Bordeaux' && bottleSpec" class="image layer-1" alt="bottle sihouette" src="./assets/Bottle silhouettes/BDX_image.png">
            </transition>
            <transition name="slide-fade">
              <img v-if="bottleType == 'Riesling' && bottleSpec" class="image layer-1" alt="bottle sihouette" src="./assets/Bottle silhouettes/RIE_image.png">
            </transition>
            <transition name="slide-fade">
              <img v-if="bottleType == 'Sparkling' && bottleSpec" class="image layer-1" alt="bottle sihouette" src="./assets/Bottle silhouettes/SPK_image.png">
            </transition>
            <transition name="slide-fade">
              <img v-if="bottleType == 'Magnum' && bottleSpec" class="image layer-1" alt="bottle sihouette" src="./assets/Bottle silhouettes/MAG_image.png">
            </transition>
            <transition name="slide-fade">
              <img v-if="bottleType == 'Premium Burgundy' && bottleSpec" class="image layer-1" alt="bottle sihouette" src="./assets/Bottle silhouettes/PBG_image.png">
            </transition>
            
            
            <div class='layer-3'>
              <div class="alert alert-danger p-5 font-weight-bold" role="alert" id='invalidWarning' v-show="showInvalid">{{ overallWarning }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import Multiselect from 'vue-multiselect'
  import measurementsForm from './components/measurementsForm.vue';

  import dataImport from './assets/data.json';
  import CONSTANTS from './assets/CONSTNATS.json';


  export default {
    name: 'App',
    components: {Multiselect, measurementsForm},
    data () {
        return {
          data: [],
          suppliers: [],
          supplierBottles: [],
          bottleTypes: [],
          bottles: [],
          supplier: null,
          bottleType: null,
          bottleId: null,
          bottleSpec: null,
          showInvalid: false,
          overallWarning: '',
          warned: false,
          globalPositions: {
            'latest': 
              {
                'id': null,
                'type': null,
                'side': null
              },
            'front': 
              {
                'maxWidth': null,
                'valid': true
              },
            'back': 
              {
                'maxWidth': null,
                'valid': true
              }
          },
          labelStatuses: {
            'front': {
              'enabled': true,
              'dissableMessage': '',
              'count': 0
            },
            'back': {
              'enabled': true,
              'dissableMessage': '',
              'count': 0
            } // Add medals here
          },
          help: false,
          helpMessage: "",
          displaySide: 'front'          // label preview stuff
        }
    },

    mounted() {
        this.loadData();

        const helpLink = `<a href=${CONSTANTS.helpLink} class='alert-link'>here</a>`;
        this.helpMessage = CONSTANTS.helpMessage.replace("[help link here]", helpLink);

        this.overallWarning = CONSTANTS.invalidWarning;
    },

    methods: {
      
      // Load data into instance and sets supplier list for multiselect
      loadData() {
          this.data = dataImport;

          this.suppliers = Object.keys(this.data);
      },

      // When the supplier is selected, sets the list of options for the bottle types and clears all flieds that require supplier
      supplierSelect(supplierSelection) {
        this.bottleTypes = Object.keys(this.data[supplierSelection]);
        this.bottleType = null;
        this.bottleId = null;
        this.bottleSpec = null;
      },

      // Clears all fields that require supplier when the supplier is removed
      supplierRemove() {
        this.bottleType = null;
        this.bottleId = null;
        this.bottleSpec = null;
      },

      // When bottle type is selected and clears all flieds that require bottleType
      // Sets list of bottle ids and adds bottle name along side each bottle id (in form ("id - name"))
      bottleTypeSelect(bottleTypeSelection) {
        this.bottles = Object.keys(this.data[this.supplier][bottleTypeSelection]);
        for (var x in this.bottles) {
          this.bottles[x] += " - " + this.data[this.supplier][bottleTypeSelection][this.bottles[x]].name
        }
        this.bottleId = null;
        this.bottleSpec = null;
      },

      // Clears all fields that require bottleType when the bottleType is removed
      bottleTypeRemove() {
        this.bottleId = null;
        this.bottleSpec = null;
      },

      // When the bottle is selected, sets the bottle spec to the spec for that specific bottle and updates displays for each input
      // Calculates bottle circumference and adds it to bottle spec
      // All numeric fields are rounded. (mins are rounded down and max is rounded up)
      bottleSelect(bottleIdSelection) {
        const bottleId = bottleIdSelection.split(" ")[0]; // Seperate name from the id and take the ID only
        this.bottleSpec = this.data[this.supplier][this.bottleType][bottleId];

        // All spec variables are rounded as fractional mm are not improtatant to this context
        // Rounding is always done in a direction to tighten constraints
        this.bottleSpec.circumference = Math.floor(this.bottleSpec.diameter * Math.PI);

        this.bottleSpec.warning.minHeightOffset = Math.ceil(this.bottleSpec.warning.minHeightOffset);
        this.bottleSpec.warning.maxHeight = Math.floor(this.bottleSpec.warning.maxHeight);
        this.bottleSpec.warning.maxWidth = Math.floor(this.bottleSpec.warning.maxWidth);
        this.bottleSpec.warning.VpointX = Math.floor(this.bottleSpec.warning.VpointX);
        this.bottleSpec.warning.UpointY = Math.floor(this.bottleSpec.warning.UpointY);

        this.bottleSpec.recomended.minHeightOffset = Math.ceil(this.bottleSpec.recomended.minHeightOffset);
        this.bottleSpec.recomended.maxHeight = Math.floor(this.bottleSpec.recomended.maxHeight);
        this.bottleSpec.recomended.maxWidth = Math.floor(this.bottleSpec.recomended.maxWidth);
      },

      // Clears bottleSpec when bottleId is removed
      bottleRemove() {
        this.bottleSpec = null;
      },

      // Dissables the back label if front label max width would define it as a wrap around
      checkWrapAround() {
        const wrapAroundBoundry = CONSTANTS.warpAroundDef * this.bottleSpec.circumference;
        if (this.globalPositions.front.maxWidth != null && this.globalPositions.front.maxWidth.width > wrapAroundBoundry) {
          this.labelStatuses.back.enabled = false;
          this.labelStatuses.back.dissableMessage = CONSTANTS.wrapAroundMessage;
        } else {
          this.labelStatuses.back.enabled = true;
          this.labelStatuses.back.dissableMessage = '';
        }
      },

      // Updates the maxWidth information for the given side when a label is updated and calls checkWrapAround()
      // Takes width from form, side of bottle {'front', 'back'} and id of label changed
      updateMaxWidth(width, side, labelId) {
        var maxWidthData = this.globalPositions[side].maxWidth;
        if (width != "") {     // If there is a width
          if (maxWidthData == null || maxWidthData.width < width) { // There is no max width yet or the submitted width is widest for that side
            this.globalPositions[side].maxWidth = {'labelId': labelId, 'width': width};

          } else if (this.globalPositions[side].maxWidth.labelId === labelId) { // If it is an update to the current max width
            // todo: check all other labels on that side to ensure the max width is grabbed (for multi-label support)
            this.globalPositions[side].maxWidth = {'labelId': labelId, 'width': width};
          }

        } else if (maxWidthData != null && this.globalPositions[side].maxWidth.labelId === labelId) {   // If what was the previous max width is now blank
          // todo: check all other labels on that side to ensure the max width is grabbed (for multi-label support)
            this.globalPositions[side].maxWidth = null;
        }

        this.checkWrapAround();
      },

      // Run when clear all forms button is clicked
      // Resets warned (allows orange zone warning message to appear again), directly calls clearForm() on measurementForm componets through refs 
      //    - Refs call is used as this is an event and it is not sutable to change the child's state
      // Resets globalPositions and labelStatuses, then calls checkWrapAround() and checkGlobalInvalid() to clear and reset any errors
      clearForm() {

        // Clear the orange zone warning as well? Just to be safe
        this.warned = false;

        this.globalPositions = {
          'latest': 
            {
              'id': null,
              'type': null,
              'side': null
            },
          'front': 
            {
              'maxWidth': null,
              'valid': true
            },
          'back': 
            {
              'maxWidth': null,
              'valid': true,
            }
        },
        this.labelStatuses = {
          'front': {
            'enabled': true,
            'dissableMessage': '',
            'count': 0
          },
          'back': {
            'enabled': true,
            'dissableMessage': '',
            'count': 0
          } // Add medals here
        }

        this.checkWrapAround();

        this.checkGlobalInvalid();

        // Multi label support here (gonna need to loop through them)
        this.$refs.backB1.clearForm();
        this.$refs.frontF1.clearForm();
      },

      // Checks if the "global level" error/invalid warning box is needed
      checkGlobalInvalid() {
        const front = this.globalPositions.front.valid || !this.labelStatuses.front.enabled;
        const back = this.globalPositions.back.valid || !this.labelStatuses.back.enabled;
        // Medal support here
        this.showInvalid = !(front && back);
      },

      // Run when a warning (orange zone) is found in a measurement form
      // Updates globalPositions
      // Shows orange zone popup warning if not yet shown or a form has been reset
      emmitedWarningCatch(payload) {
        const {warning, labelId, side, type, form} = payload;

        this.globalPositions.latest = {'id': labelId, 'side':side, 'type':type};
        // Modify for multi label support
        this.globalPositions[side].valid = true;

        this.globalPositions[side][labelId] = form;   // Add/update new data to set

        this.labelStatuses[side].count = Object.keys(this.globalPositions[side]).length - 2;    // -2 accounts for the 'maxWidth' and 'valid' keys
        
        this.updateMaxWidth(form.width, side, labelId);

        this.checkGlobalInvalid();

        if (this.form != null && this.form.heightOffset != null) {
          this.updatePreview();
        }

        if (warning == 'orange zone') {
          if (!this.warned) {
            this.showWarning(
              CONSTANTS.orangeZoneMeaage,
              'Caution:'
            );
            this.warned = true;
          }
        }
      },

      // Creates a popup modal to warn the user (uses simple-alert-for-vue-js)
      // Warning will have the specified title, body message and will display
      showWarning(Message, title) {
        this.$alert(
          Message,
          title,
          "warning"
        );
      },

      // Runs when a invalid input is found in a measurement form
      // Updates globalPositions
      emmittedInvalidLabel(payload) {
        const {labelId, side, type} = payload;

        this.globalPositions.latest = {'id': labelId, 'side':side, 'type':type};

        // Modify for multi label support
        this.globalPositions[side].valid = false;
        this.checkGlobalInvalid();

        this.updatePreview();
      },

      // Runs when a valid input is found in a measurement form
      // UpdatesglobalPositions
      // Checks and updates (if needed) the maxWidth value for the given labels side
      emmittedValidLabel(payload) {

        const {form, labelId, side, type} = payload;

        this.globalPositions.latest = {'id': labelId, 'side':side, 'type':type};

        // Modify for multi label support
        this.globalPositions[side].valid = true;

        this.globalPositions[side][labelId] = form;   // Add/update new data to set
        this.labelStatuses[side].count = Object.keys(this.globalPositions[side]).length - 2;    // -2 accounts for the 'maxWidth' and 'valid' keys

        this.updateMaxWidth(form.width, side, labelId);

        this.checkGlobalInvalid();

        if (form != null) {
          this.updatePreview();
        }
      },

      // Select which side the label preview is displaying and highlight the respective side's button
      displaySelect(side) {
        this.displaySide = side;
        switch (side) {
          case 'front':
            document.getElementById('frontDisplayButton').classList.add("selected");
            document.getElementById('backDisplayButton').classList.remove("selected");
            break;
          case 'back':
            document.getElementById('backDisplayButton').classList.add("selected");
            document.getElementById('frontDisplayButton').classList.remove("selected");
            break;
          case 2:
        }
        if (this.bottleSpec != null) {
          this.updatePreview();
        }
      },

      // Todo: multi label support

      // Fetches label measurements, calculates warped 2D width based on bottle size, displays label
      //    - Fetching and display functionality is handeled in helper functions
      updatePreview() {
        const diamiter = this.bottleSpec.diameter;
        const radius = diamiter/2;

        var labels = {};
        // loop for multi label
        labels['front'] = this.fetchDisplayMeasurements('front', 'F1');
        labels['back'] = this.fetchDisplayMeasurements('back', 'B1');

        var main = {};
        var overflow = {};
        if (this.displaySide == 'front') {
          main = labels['front'];
          overflow = labels['back'];
        } else {
          main = labels['back'];
          overflow = labels['front'];
        }

        if (main.theta <= Math.PI) {
          main['adjustedWidth'] = 2 * Math.sin(main.theta/2) * radius;
        } else {
          main['adjustedWidth'] = diamiter;
        }

        if (overflow.theta > Math.PI) {
          overflow.theta -= Math.PI;
          overflow['adjustedWidth'] = radius - (Math.cos(overflow.theta/2) * radius);
        } else {
          overflow['adjustedWidth'] = 0;
        }

        this.displayLabel("labelPreview", main);
        this.displayLabel("labelPreviewOverflowLeft", overflow);
        this.displayLabel("labelPreviewOverflowRight", overflow);
      },

      // Fetches height and height offset for the specified label and calculates the width of the label as an angle on the radius of the bottle
      // Default values are 0, if a height offset of 0 is found the label is hidden
      fetchDisplayMeasurements(side, labelId) {

        const fullHeight = CONSTANTS[this.bottleType + "Height"];

        var heightOffset = 0;
        var height = 0;
        var theta = 0;
        if (this.globalPositions[side][labelId] != null && this.globalPositions[side].valid) {
          heightOffset = (this.globalPositions[side][labelId].heightOffset/fullHeight)*100;
          height = (this.globalPositions[side][labelId].height/fullHeight)*100;
          theta = (2 * this.globalPositions[side][labelId].width * Math.PI) / this.bottleSpec.circumference;
        }
        if (heightOffset == 0) {  
          height = 0;
          theta = 0;
        }
        return {'heightOffset':heightOffset, 'height':height, 'theta':theta};
      },

      // Todo: multi label support
        // Will need multiple div squares per label. (create dynamically??????)

      // Sets demensions of the label preview on the bottle and places it in the right possition
      displayLabel(element, label) {

        const diamiter = this.bottleSpec.diameter;

        document.getElementById(element).style.height = `${label.height}%`;
        document.getElementById(element).style.width = `${(label.adjustedWidth/diamiter)*100*0.47}%`;
        document.getElementById(element).style.bottom = `${label.heightOffset}%`;
        
        switch (element) {
          case "labelPreview":
            document.getElementById("labelPreview").style.left = `${50 - ((label.adjustedWidth/diamiter)*100*0.47)/2}%`;
            break;
          case "labelPreviewOverflowLeft":
            document.getElementById("labelPreviewOverflowLeft").style.left = `${26.5}%`;
            break;
          case "labelPreviewOverflowRight":
            document.getElementById("labelPreviewOverflowRight").style.left = `${100-26.5 - label.adjustedWidth/diamiter*100*0.47}%`;
            break;
        }
      }
    }
  }

</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>

<style>

body{
  background-image: url('./assets/background.jpg');
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-size: cover;
  background-position: center;
  min-width: 350px;
}

.container-fluid{
  margin-top: 60px;
  margin-bottom: 60px;
  border-radius: 8px;
  background-color: rgb(255,255,255,0.9);
  padding: 60px;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  padding-top: 60px;
  padding-left: 2%;
}

.pre-formatted {
  white-space: pre-wrap;
  padding: 5px;
}

.header {
  padding: 15px 10px 5px 10px;
  text-align: center;
  font-size: 20px;
}

.multi-select {
  margin: 5px;
}
.image {
  width: 50%;
}

.layer-1 {
  z-index: 0;
  position: relative;
}

.layer-2 {
  z-index: 1;
  position: absolute;
  width: 50%
}

.layer-3 {
  z-index: 2;
  position: absolute;
  top: 50%;
  left: 15%;
  width: 70%;
}


.help-button {
  float: right;
  margin: 5px;
  text-align: center;
  padding: 3px 10px 3px;
  border-radius: 8px;
  border: 1px solid lightgrey;
  background: #cffeff;
  opacity: 0.7;
  outline:none !important;
  outline-width: 0 !important;
}

.close {
  background: none;
  border: none;
  float: right;
}

.help {
  font-size: 95%;
  text-align: left;
  width: 100%;
  outline:none !important;
  outline-width: 0 !important;
}

.labelPreview {
  width: 0%;
  left: 50%;
  height: 0%;
  background-color: grey;
  opacity: 80%;
}

.dotted {
  border-style: dotted;
}

.preview {
  height: 100%;
}

.clear {
  float: right;
  margin: 5px;
  text-align: center;
  padding: 3px 10px 3px;
  border-radius: 8px;
  border: 1px solid lightgrey;
  background: white;
  opacity: 0.6;
  color: red;
  outline:none !important;
  outline-width: 0 !important;
}

.sideToggle {
  margin: 5px;
  text-align: center;
  padding: 3px 10px 3px;
  border-radius: 6px;
  border: 2px groove darkgray;
  background: lightgray;
  opacity: 0.9;
  outline:none !important;
  outline-width: 0 !important;
}

.selected {
  /* border-style: inset; */
  border: 2.5px inset #4ddbf7;
  opacity: 0.9;
  outline:none !important;
  outline-width: 0 !important;
}

.slide-fade-enter-active {
  transition: all .4s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
.slide-fade-leave-active {
  transition: all .8s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
.slide-fade-enter, .slide-fade-leave-to
/* .slide-fade-leave-active below version 2.1.8 */ {
  /* transform: translateX(10px); */
  opacity: 0;
}


</style>
