<template>
  <div id="app" class="container-fluid main-backing col-lg-10 offset-lg-1">

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
        <div>
          <multiselect 
            class='multi-select'
            v-model="labelStatuses.selected" 
            placeholder="Select the labels you want"
            :close-on-select="false" 
            :options="validLabelOptions"
            :multiple="true"
            :max="4"
            :disabled="!bottleSpec"
            @select='addLabel'
            @remove='removeLabel'
          >Label choice</multiselect>
        </div>
        <div class="row">
          <div class='col-lg-12'>
            <button class="clear" v-if='!help' v-on:click="clearForm()" :disabled="!bottleSpec">Clear all</button>
            <button class='help-button' v-if='!help' v-on:click="help = true">Help</button>
            <button 
              class='medal-button' 
              v-if='!help && !medalMode' 
              v-on:click="medalMode = !medalMode"
              :disabled="labelStatuses.filled.length < globalPositions.activeLabels.length || globalPositions.activeLabels.length == 0 || globalPositions.activeMedals == 0"
              >Medals
            </button>
            <button class='medal-button' v-if='!help && medalMode' v-on:click="medalMode = !medalMode">Labels</button>
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
            <button class="clear" v-on:click="clearForm()" :disabled="!bottleSpec">Clear all</button>
            <button 
              class='medal-button' 
              v-if='help && !medalMode' 
              v-on:click="medalMode = !medalMode"
              :disabled="labelStatuses.filled.length < globalPositions.activeLabels.length || globalPositions.activeLabels.length == 0 || globalPositions.activeMedals == 0"
              >Medals
            </button>
            <button class='medal-button' v-if='!help && medalMode' v-on:click="medalMode = !medalMode">Labels</button>
          </div>
        </div>

        <div class="row" v-show="!medalMode || globalPositions.activeLabels.length == 0 || labelStatuses.filled.length != globalPositions.activeLabels.length">
          <div class="col-lg-6">
            <label class="header" v-if="bottleSpec">Front labels</label>
            <label class="header dissabled-text" v-else>Front labels</label>
            <measurements-form
              v-for="n in labelStatuses.front.count"
              :key="'F' + n"
              :id="'frontF' + n"
              ref=n
              side="front"
              :labelId="'F' + n"
              :bottleSpec="bottleSpec"
              :globalPositions="globalPositions"
              v-show='labelStatuses.front.enabled'
              @invalid="emmittedInvalidLabel"
              @valid="emmittedValidLabel"
              @warning="emmitedWarningCatch"
              >
            </measurements-form>
            <label v-if="!labelStatuses.front.enabled">{{ labelStatuses.front.dissableMessage }}</label>
            <div class="alert alert-warning" role="alert" id='frontDissabledWarning' v-if="!labelStatuses.front.enabled">{{ labelStatuses.front.dissableMessage }}</div>
          </div>
          <div class="col-lg-6">
            <label class="header" v-if="bottleSpec">Back labels</label>
            <label class="header dissabled-text" v-else>Back labels</label>
            <measurements-form
              v-for="n in labelStatuses.back.count"
              :key="'B' + n"
              :id="'backB' + n"
              ref=n
              side="back"
              :labelId="'B' + n"
              :bottleSpec="bottleSpec"
              :globalPositions="globalPositions"
              v-show='labelStatuses.back.enabled'
              @invalid="emmittedInvalidLabel"
              @valid="emmittedValidLabel"
              @warning="emmitedWarningCatch"
              >
            </measurements-form>
            <div class="alert alert-warning invalidWarning" role="alert" id='backDissabledWarning' v-if="!labelStatuses.back.enabled">{{ labelStatuses.back.dissableMessage }}</div>
          </div>
        </div>
        <div class="row" v-show="medalMode && globalPositions.activeLabels.length != 0 && labelStatuses.filled.length == globalPositions.activeLabels.length">
          <label class="pre-formatted medal-help" v-html="medalPlacementHelp"></label>
          <measurements-form-medals
              v-for="n in labelStatuses.medal.count"
              :key="'M' + n"
              :id="'medalM' + n"
              ref=n
              side="medal"
              :labelId="'M' + n"
              :bottleSpec="bottleSpec"
              :globalPositions="globalPositions"
              v-show='labelStatuses.medal.enabled'
              @invalid="emmittedInvalidLabel"
              @valid="emmittedValidLabel"
              >
          </measurements-form-medals>
        </div>
      </div>


      <div class='col-lg-6'>
        <div class="row">
          <button id="frontDisplayButton" class="sideToggle selected" v-on:click="displaySelect('front')">Front view</button>
          <button id="backDisplayButton" class="sideToggle" v-on:click="displaySelect('back')">Back view</button>
        </div>
        <label class='header' v-if="!bottleSpec">{{ selectHelpMessage }}</label>
        <br>
        <div class="row">
          <div id="preview" class="col-lg-8 offset-lg-2 preview">

            <div class="layer-2 labelPreview" id='labelPreview1'></div>
            <div class="layer-2 labelPreview" id='labelPreviewOverflowLeft1'></div>
            <div class="layer-2 labelPreview" id='labelPreviewOverflowRight1'></div>

            <div class="layer-3 labelPreview" id='labelPreview2'></div>
            <div class="layer-3 labelPreview" id='labelPreviewOverflowLeft2'></div>
            <div class="layer-3 labelPreview" id='labelPreviewOverflowRight2'></div>

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
            
            <div class='layer-10'>
              <div class="alert alert-danger p-5 font-weight-bold" role="alert" id='invalidWarning' v-show="showInvalid">{{ overallWarning }}</div>
            </div>
          </div>
        </div>
        <div class="row">
          <div id="previewLabel" class="col-lg-8 offset-lg-2 preview">
            <transition name="slide-fade">
              <label v-if="bottleType && bottleSpec" class="disclaimer" v-html=bottlePreviewDisclaimer></label>
            </transition>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import Multiselect from 'vue-multiselect'
  import measurementsForm from './components/measurementsForm.vue';
  import measurementsFormMedals from './components/measurementsFormMedals.vue';

  import dataImport from './assets/data.json';
  import CONSTANTS from './assets/CONSTANTS.json';


  export default {
    name: 'App',
    components: {Multiselect, measurementsForm, measurementsFormMedals},
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
                'maxWidth': null
              },
            'back': 
              {
                'maxWidth': null
              },
            'medal': {},
            'activeLabels': [],
            'activeMedals': []
          },
          labelStatuses: {
            'hasWrap': false,
            'selected': [],
            'filled': [],
            'front': {
              'enabled': true,
              'dissableMessage': '',
              'count': 0
            },
            'back': {
              'enabled': true,
              'dissableMessage': '',
              'count': 0
            },
            'medal': {
              'enabled': true,
              'dissableMessage': '',
              'count': 0
            }
          },
          help: false,
          helpMessage: "",
          bottlePreviewDisclaimer: "",
          displaySide: 'front',          // label preview stuff
          validLabelOptions: [],
          selectHelpMessage: '',

          medalMode: false,  // toggle between labels and medals using button
          medalPlacementHelp: 'test'
        }
    },

    mounted() {
        this.loadData();

        const helpLink = `<a href=${CONSTANTS.helpLink} class='alert-link'>here</a>`;
        this.helpMessage = CONSTANTS.helpMessage.replace("[help link here]", helpLink);

        this.overallWarning = CONSTANTS.invalidWarning;
        this.bottlePreviewDisclaimer = CONSTANTS.bottlePreviewDisclaimer;
        this.selectHelpMessage = CONSTANTS.selectHelpMessage;

        this.validLabelOptions = [CONSTANTS.labelNames.F1, CONSTANTS.labelNames.B1];
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

        const optimumZone = Math.round(CONSTANTS.optimumMedalZoneScale * this.bottleSpec.circumference / 2);
        this.medalPlacementHelp = CONSTANTS.medalPlacementHelp.replace("[measure here]", optimumZone);
      },

      // Clears bottleSpec when bottleId is removed
      bottleRemove() {
        this.bottleSpec = null;
      },

      // Dissables the back label if front label max width would define it as a wrap around
      checkWrapAround() {

        const wrapAroundBoundry = CONSTANTS.warpAroundDef * this.bottleSpec.circumference;
        if (this.globalPositions.front.maxWidth != null && this.globalPositions.front.maxWidth > wrapAroundBoundry) {
          this.labelStatuses.back.enabled = false;
          this.labelStatuses.back.dissableMessage = CONSTANTS.wrapAroundMessage;
          this.labelStatuses.hasWrap = true;
          if (this.globalPositions.activeLabels.includes('F2')) {
            document.getElementById('frontF2').classList.add("hidden"); // This is done as it is simpler than trying to putting a v-show in a v-for that doesn't cover all components in the v-for
          }
        } else {
          this.labelStatuses.back.enabled = true;
          this.labelStatuses.back.dissableMessage = '';
          this.labelStatuses.hasWrap = false;
          if (this.globalPositions.activeLabels.includes('F2')) {
            document.getElementById('frontF2').classList.remove("hidden");  // This is done as it is simpler than trying to putting a v-show in a v-for that doesn't cover all components in the v-for
          }
        }
      },

      // When label selected in multi select
      // Updates label counts
      // Updates validLabelOptions
      // Adds label to active labels
      // Updates globalPositions.latest to be a global to force updates in child measurement forms
      // Label: selection from the multi select
      addLabel(label) {
        //update count: type, global

        if (label.toLowerCase().includes(CONSTANTS.labelNames.F1.toLowerCase())) {
          this.labelStatuses.front.count += 1;
        } else if (label.toLowerCase().includes(CONSTANTS.labelNames.B1.toLowerCase())) {
          this.labelStatuses.back.count += 1;
        } else if (label.toLowerCase().includes(CONSTANTS.labelNames.M1.toLowerCase())) {
          this.labelStatuses.medal.count += 1;
        }

        //add dependent labels
        if (label == CONSTANTS.labelNames.F1) {
          this.validLabelOptions.push(CONSTANTS.labelNames.F2);
          this.validLabelOptions.push(CONSTANTS.labelNames.M1);

        } else if (label == CONSTANTS.labelNames.B1) {
          this.validLabelOptions.push(CONSTANTS.labelNames.B2);

        } else if (label == CONSTANTS.labelNames.M1) {
          this.validLabelOptions.push(CONSTANTS.labelNames.M2);
        }


        switch (label) {
          case CONSTANTS.labelNames.F1:
            this.globalPositions.activeLabels.push('F1');
            break;
          case CONSTANTS.labelNames.B1:
            this.globalPositions.activeLabels.push('B1');
            break;
          case CONSTANTS.labelNames.F2:
            this.globalPositions.activeLabels.push('F2');
            break;
          case CONSTANTS.labelNames.B2:
            this.globalPositions.activeLabels.push('B2');
            break;
          case CONSTANTS.labelNames.M1:
            this.globalPositions.activeMedals.push('M1');
            break;
          case CONSTANTS.labelNames.M2:
            this.globalPositions.activeMedals.push('M2');
            break;
        }

        this.globalPositions.latest.id = 'global';
      },

      // Minor helper function, removes the given item from the array and returns the resultant array
      arrayRemove(array, item) {
        var index = array.indexOf(item);
        if (index > -1) {
          array.splice(index, 1);
        }
        return array;
      },

      cleanLabel(ID, side, deselect) {
        if (deselect) {
          this.labelStatuses.selected = this.arrayRemove(this.labelStatuses.selected, CONSTANTS.labelNames[ID]);
        }

        this.labelStatuses[side].count -= 1;
        if (side != 'medal') {
          this.globalPositions.activeLabels = this.arrayRemove(this.globalPositions.activeLabels, ID);
          this.labelStatuses.filled = this.arrayRemove(this.labelStatuses.filled, ID);
        } else {
          this.globalPositions.activeMedals = this.arrayRemove(this.globalPositions.activeMedals, ID);
        }

        this.medalMode &= this.globalPositions.activeMedals.length > 0;
        
        this.globalPositions[side][ID] = null;
      },

      // When label deslected in multi select
      // Removes dependent labels from thevalid options and from the active selections
      // Updates label counts
      // Nullifies the labels information in globalPositions
      // Updates max width valeus
      // Updates label preview
      // Updates global invalid
      // Label: multi select option that was removed
      removeLabel(label) {
        //medals logic stuff
        if (label == CONSTANTS.labelNames.F1) {
          this.validLabelOptions = this.arrayRemove(this.validLabelOptions, CONSTANTS.labelNames.F2);
          this.validLabelOptions = this.arrayRemove(this.validLabelOptions, CONSTANTS.labelNames.M1);
          this.validLabelOptions = this.arrayRemove(this.validLabelOptions, CONSTANTS.labelNames.M2);

          if (this.labelStatuses.selected.includes(CONSTANTS.labelNames.F2)) {
            this.cleanLabel('F2', 'front', true);
          }
          if (this.labelStatuses.selected.includes(CONSTANTS.labelNames.M1)) {
            this.cleanLabel('M1', 'medal', true);
          }
          if (this.labelStatuses.selected.includes(CONSTANTS.labelNames.M2)) {
            this.cleanLabel('M2', 'medal', true);
          }
          
          this.cleanLabel('F1', 'front', false);

          this.updateMaxWidth('front');
        }

        if (label == CONSTANTS.labelNames.B1) {
          this.validLabelOptions = this.arrayRemove(this.validLabelOptions, CONSTANTS.labelNames.B2);

          if (this.labelStatuses.selected.includes(CONSTANTS.labelNames.B2)) {
            this.cleanLabel('B2', 'back', true);
          }

          this.cleanLabel('B1', 'back', false);

          this.updateMaxWidth('back');
        }

        if (label == CONSTANTS.labelNames.M1) {
          this.validLabelOptions = this.arrayRemove(this.validLabelOptions, CONSTANTS.labelNames.M2);

          if (this.labelStatuses.selected.includes(CONSTANTS.labelNames.M2)) {
            this.cleanLabel('M2', 'medal', true);
          }

          this.cleanLabel('M1', 'medal', false);
        }

        if (label == CONSTANTS.labelNames.M2) {
          this.cleanLabel('M2', 'medal', false);
        }

        if (label == CONSTANTS.labelNames.F2) {
          this.cleanLabel('F2', 'front', false);
          this.updateMaxWidth('front');
        }

        if (label == CONSTANTS.labelNames.B2) {
          this.cleanLabel('B2', 'front', false);
          this.updateMaxWidth('back');
        }

        this.globalPositions.latest.id = 'global';

        this.clearPreview();
        this.updatePreview();

        this.checkGlobalInvalid();
      },

      // Updates the maxWidth information for the given side when a label is updated and calls checkWrapAround()
      // Side: side of the bottle being updated
      updateMaxWidth(side) {

        var maxWidthValue = null;

        Object.keys(this.globalPositions[side]).forEach((element) => {
          if (element != 'maxWidth' && this.globalPositions[side][element] != null) {
            if (this.globalPositions[side][element].width > maxWidthValue) {
              maxWidthValue = this.globalPositions[side][element].width;
            }
          }
        });

        this.globalPositions[side].maxWidth = maxWidthValue;

        this.checkWrapAround();
      },

      // Run when clear all forms button is clicked
      // Resets warned (allows orange zone warning message to appear again), directly calls clearForm() on measurementForm componets through refs 
      //    - Refs call is used as this is an event and it is not sutable to change the child's state
      // Resets globalPositions and labelStatuses, then calls checkWrapAround() and checkGlobalInvalid() to clear and reset any errors
      clearForm() {
        
        // Clear the orange zone warning as well? Just to be safe
        this.warned = false;

        if (this.globalPositions.activeLabels.includes('F2')) {
          document.getElementById('frontF2').classList.remove("hidden");  // This is done as it is simpler than trying to putting a v-show in a v-for that doesn't cover all components in the v-for
        }

        const activeLabels = this.globalPositions.activeLabels;
        const activeMedals = this.globalPositions.activeMedals;

        this.globalPositions = {
          'latest': 
            {
              'id': null,
              'type': null,
              'side': null
            },
          'front': 
            {
              'maxWidth': null
            },
          'back': 
            {
              'maxWidth': null
            },
          'medal': {},
          'activeLabels': activeLabels,
          'activeMedals': activeMedals
        },
        this.labelStatuses.front.enabled = true;
        this.labelStatuses.front.dissableMessage = '';
        this.labelStatuses.back.enabled = true;
        this.labelStatuses.back.dissableMessage = '';
        this.labelStatuses.filled = [];
        this.medalMode = false;
        
        this.checkWrapAround();

        this.checkGlobalInvalid();

        this.$refs.n.forEach(form => form.clearForm());

        this.clearPreview();

      },

      // Checks if the "global level" error/invalid warning box is needed
      checkGlobalInvalid() {
        var front = Object.keys(this.globalPositions.front).every((element)=> {
          if (element != 'maxWidth' && this.globalPositions.front[element] != null) {
            return this.globalPositions.front[element].valid;
          } else {
            return true;
          }
        });
        front |= !this.labelStatuses.front.enabled;
        var back = Object.keys(this.globalPositions.back).every((element)=> {
          if (element != 'maxWidth' && this.globalPositions.back[element] != null) {
            return this.globalPositions.back[element].valid;
          } else {
            return true;
          }
        });
        back |= !this.labelStatuses.back.enabled;
        // Medal support here
        this.showInvalid = !(front && back);
      },

      // Run when a warning (orange zone) is found in a measurement form
      // Updates globalPositions
      // Shows orange zone popup warning if not yet shown or a form has been reset
      emmitedWarningCatch(payload) {
        const {warning, labelId, side, type, form} = payload;

        this.globalPositions.latest = {'id': labelId, 'side':side, 'type':type};

        this.globalPositions[side][labelId] = form;   // Add/update new data to set

        this.labelStatuses.filled = this.arrayRemove(this.labelStatuses.filled, labelId);
        if (form.height != '' && form.width != '' && form.heightOffset != '') {
          if (labelId[1] == 2 && this.labelStatuses.filled.includes(labelId[0] + '1')) {
            this.labelStatuses.filled.push(labelId);
          } else if (labelId[1] == 1) {
            this.labelStatuses.filled.push(labelId);
          }
        }
        
        this.updateMaxWidth(side);

        this.checkGlobalInvalid();

        if (this.form != null) {
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

        this.globalPositions[side][labelId].valid = false

        if (side != 'medal') {
          this.labelStatuses.filled = this.arrayRemove(this.labelStatuses.filled, labelId);
        }

        this.checkGlobalInvalid();

        this.updatePreview();
      },

      // Runs when a valid input is found in a measurement form
      // UpdatesglobalPositions
      // Checks and updates (if needed) the maxWidth value for the given labels side
      emmittedValidLabel(payload) {

        const {form, labelId, side, type} = payload;

        this.globalPositions.latest = {'id': labelId, 'side':side, 'type':type};

        this.globalPositions[side][labelId] = form;   // Add/update new data to set

        if (side != 'medal') {
          this.labelStatuses.filled = this.arrayRemove(this.labelStatuses.filled, labelId);
          if (form.height != '' && form.width != '' && form.heightOffset != '') {
            if (labelId[1] == 2 && this.labelStatuses.filled.includes(labelId[0] + '1')) {
              this.labelStatuses.filled.push(labelId);
            } else if (labelId[1] == 1) {
              this.labelStatuses.filled.push(labelId);
            }
          }

          this.updateMaxWidth(side);
        }

        this.checkGlobalInvalid();

        if (form != null) {
          this.updatePreview();
        }
      },

      // Select which side the label preview is displaying and highlight the respective side's button
      // updates preview if there is a bottle spec
      // side: side of bottle, must be one of {'front', 'back'}
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
          this.clearPreview();
          this.updatePreview();
        }
      },

      // Todo: multi label support

      // Fetches label measurements, calculates warped 2D width based on bottle size, displays label
      //    - Fetching and display functionality is handeled in helper functions
      updatePreview() {
        const diamiter = this.bottleSpec.diameter;
        const radius = diamiter/2;

        var labels = {'front': {}, 'back': {}};
        // loop for multi label

        for (var id of this.globalPositions.activeLabels) {
          if (id[0].toLowerCase() == 'f') {
            labels.front[id] = this.fetchDisplayMeasurements('front', id, radius);
          } else if (id[0].toLowerCase() == 'b') {
            labels.back[id] = this.fetchDisplayMeasurements('back', id, radius);
          }
        }

        var main = {};
        var overflow = {};
        if (this.displaySide == 'front') {
          main = labels.front;
          overflow = labels.back;
        } else {
          main = labels.back;
          overflow = labels.front;
        }

        var  label;
        for (var x in main) {
          label = main[x];
          if (label.theta <= Math.PI) {
            label['adjustedWidth'] = 2 * Math.sin(label.theta/2) * radius;
          } else {
            label['adjustedWidth'] = diamiter;
          }
          this.displayLabel("labelPreview"+x[1], label);
        }

        for (var y in overflow) {
          label = overflow[y];
          if (label.theta > Math.PI) {
            label.theta -= Math.PI;
            label['adjustedWidth'] = radius - (Math.cos(label.theta/2) * radius);
          } else {
            label['adjustedWidth'] = 0;
          }
          this.displayLabel("labelPreviewOverflowLeft"+y[1], label);
          this.displayLabel("labelPreviewOverflowRight"+y[1], label);
        }
      },

      // Fetches height and height offset for the specified label and calculates the width of the label as an angle on the radius of the bottle
      // Default values are 0, if a height offset of 0 is found the label is hidden
      fetchDisplayMeasurements(side, labelId, radius) {

        var heightOffset = 0;
        var height = 0;
        var theta = 0;
        if (this.globalPositions[side][labelId] != null && this.globalPositions[side][labelId].valid) {
          heightOffset = this.globalPositions[side][labelId].heightOffset;
          height = this.globalPositions[side][labelId].height;
          theta = this.globalPositions[side][labelId].width / radius;
        }
        if (heightOffset == 0) {  
          height = 0;
          theta = 0;
        }
        if (this.labelStatuses.hasWrap && labelId != 'F1') {  // Medals support here
          height = 0;
          theta = 0;
        }

        return {'heightOffset':heightOffset, 'height':height, 'theta':theta};
      },

      // Clears all labels off label preview
      clearPreview() {
        const blank = {'height': 0, 'adjustedWidth': 0, 'heightOffset': 0}
        this.displayLabel('labelPreview1', blank);
        this.displayLabel('labelPreviewOverflowLeft1', blank);
        this.displayLabel('labelPreviewOverflowRight1', blank);

        this.displayLabel('labelPreview2', blank);
        this.displayLabel('labelPreviewOverflowLeft2', blank);
        this.displayLabel('labelPreviewOverflowRight2', blank);
      },

      // Sets demensions of the label preview on the bottle and places it in the right possition
      displayLabel(element, label) {

        const diamiter = this.bottleSpec.diameter;
        const fullHeight = CONSTANTS[this.bottleType + "Height"];

        document.getElementById(element).style.height = `${(label.height/fullHeight)*100}%`;
        document.getElementById(element).style.width = `${(label.adjustedWidth/diamiter)*100*0.47}%`;
        document.getElementById(element).style.bottom = `${(label.heightOffset/fullHeight)*100}%`;

        if (element.includes('OverflowLeft')) {
          document.getElementById(element).style.left = `${26.5}%`;
        } else if (element.includes('OverflowRight')) {
          document.getElementById(element).style.left = `${100-26.5 - label.adjustedWidth/diamiter*100*0.47}%`;
        } else {
          document.getElementById(element).style.left = `${50 - ((label.adjustedWidth/diamiter)*100*0.47)/2}%`;
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

.main-backing{
  margin-top: 60px;
  margin-bottom: 60px;
  border-radius: 8px;
  background-color: rgb(255,255,255,0.93);
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

.hidden {
    visibility: hidden !important;
}

.pre-formatted {
  white-space: pre-wrap;
  padding: 5px;
}

.dissabled-text {
    opacity: 0.7;
}

.header {
  padding: 15px 10px 5px 10px;
  text-align: center;
  font-size: 20px;
}

.disclaimer {
  padding: 10px;
  text-align: center;
  font-size: 15px;
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
}

.layer-3 {
  z-index: 2;
  position: absolute;
}

.layer-4 {
  z-index: 6;
  position: absolute;
  border-radius: 50%;
}

.layer-10 {
  z-index: 10;
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

.medal-button {
  float: left;
  margin: 5px;
  text-align: center;
  padding: 3px 10px 3px;
  border-radius: 8px;
  border: 1px solid lightgrey;
  background: white;
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

.medal-help {
  margin-left: 1.8%;
  float: left;
  font-size: 93%;
}

.labelPreview {
  width: 0%;
  left: 50%;
  height: 0%;
  background-color: lightgrey;
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
