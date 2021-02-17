<template>
    <div id=inputs class="container-fluid medal-form">
        <hr v-if="labelId[1] > 1">
        <div class="row row-cols-12">
            <div class="col-12">
                <multiselect 
                    class='multi-select'
                    v-model="type" 
                    placeholder="What type of medal do you want?"
                    :close-on-select="true" 
                    :options="['Button medal', 'Strip medal']"
                    :multiple="false"
                    @select="selectedType"
                    @remove="validate('type clear');"
                >Medal type</multiselect>
            </div>
        </div>

        <div class="row row-cols-12" v-show="type">
            <div class='col-sm-6'>

                <div class="row">
                    <div class="col-5">
                        <label v-if="type == 'Button medal'" class="sub-title-formatted-medal" v-html="titles.diameterLabel"></label>
                        <label v-if="type == 'Strip medal'" class="sub-title-formatted-medal" v-html="titles.heightLabel"></label>
                    </div>
                </div>
                <div class="row">
                    <div class="col-5">
                        <input
                            :disabled="!bottleSpec"
                            class="standard-input"
                            :id='labelId+"-input-height"'
                            v-model.number="height"
                            required
                            @keyup="inputChange('height')"
                            @keydown="keyDown"
                            v-tooltip.right="{ content: warnHeight, classes: heightWarnClass }"
                        >
                    </div>
                    <div class="col-7">
                        <label class="pre-formatted-left" v-html="heightDescription"></label>
                    </div>
                </div>

                <div class="row">
                    <div class="col-5">
                        <label v-if="type" class="sub-title-formatted-medal" v-html="titles.overlapLabel"></label>
                    </div>
                </div>
                <div class="row">
                    <div class="col-5">
                        <input
                            :disabled="!bottleSpec"
                            class="standard-input"
                            :id='labelId+"-input-overlap"'
                            v-model.number="overlap"
                            required
                            @keyup="inputChange('overlap')"
                            @keydown="keyDown"
                            v-tooltip.right="{ content: warnOverlap, classes: overlapWarnClass }"
                        >
                    </div>
                    <div class="col-7">
                        <label  v-show="type" class="pre-formatted-left" v-html="overlapDescription"></label>
                    </div>
                </div>

            </div>
            <div class='col-sm-6' v-show="type == 'Strip medal'">
                <div class="row">
                    <div class="col-5">
                        <label class="sub-title-formatted-medal" v-html="titles.widthLabel"></label>
                    </div>
                </div>
                <div class="row">
                    <div class="col-5">
                        <input
                            v-show="type == 'Strip medal'"
                            :disabled="!bottleSpec"
                            class="standard-input"
                            :id='labelId+"-input-width"'
                            v-model.number="width"
                            required
                            @keyup="inputChange('width')"
                            @keydown="keyDown"
                            v-tooltip.right="{ content: warnWidth, classes: widthWarnClass }"
                        >
                    </div>
                    <div class="col-7">
                        <label  v-show="type == 'Strip medal'" class="pre-formatted-left" v-html="widthDescription"></label>
                    </div>
                </div>
            </div>
            <label id="singleMedalMessage" class="single-medal-help" v-show="labelId[1] > 1 && type" v-html="singleMedalDisclaimer"></label>
        </div>
    </div>
</template>

<script>
    import Multiselect from 'vue-multiselect'

    import CONSTANTS from '../assets/CONSTANTS.json';

    export default {
        name: 'measurementsForm',

        components: {Multiselect},
        
        props: {
            bottleSpec: {},
            labelId: {
                required: true
            },
            globalPositions: {}
        },

        watch: {
            bottleSpec: {
                handler() {
                    if (this.bottleSpec != null) {
                        this.maxStripHeight = this.bottleSpec.recommended.maxHeight;

                        this.updateHeightDescription();
                        this.updateWidthDescription();
                        this.updateOverlapDescription();

                        this.validate();
                    }  
                },
                deep: true
            },
            globalPositions: {
                // {'id': labelId, 'side':side, 'type':type}
                // Update for multi label
                handler() {
                    if (this.globalPositions.latest.id != this.labelId) {
                        
                        this.queue.push(this.globalPositions.latest.id);
                        clearTimeout(this.delayWatcherTimer);
                        this.delayWatcherTimer = setTimeout(()=>{
                            var ID;
                            while(this.queue.length > 0) {
                                ID = this.queue.shift();

                                if (this.globalPositions.activeLabels.includes('F2') && ID == 'F2') {
                                    this.validate('props');
                                    
                                    this.updateOverlapDescription();
                                    if (this.type == 'Strip medal') {
                                        this.updateWidthDescription();
                                    }
                                    this.updateHeightDescription();
                                } else if (ID == 'F1') {
                                    this.validate('props');

                                    this.updateOverlapDescription();
                                    if (this.type == 'Strip medal') {
                                        this.updateWidthDescription();
                                    }
                                    this.updateHeightDescription();
                                }
                            }
                        }, 600);
                    }
                },
                deep: true
            }
        },

        data () {
            return {
                type: null,
                height: '',
                width: '',

                heightDescription: "",
                widthDescription: "",
                overlapDescription: "",

                delayTimer: null,
                valid: true,
                validHeight: true,
                validWidth: true,
                validOverlap: true,

                warnHeight: null,
                warnWidth: null,
                warnOverlap: null,
                heightWarnClass: '',
                widthWarnClass: '',
                overlapWarnClass: '',

                queue: [],

                overlapMin: 0,
                overlapMax: 0,
                overlap: null,
                heightOffset: null,
                labelsTop: null,
                maxStripHeight: null,

                titles: {},
                singleMedalDisclaimer: ''
            }
        },

        mounted() {
            this.titles = CONSTANTS.titles;
            this.singleMedalDisclaimer = CONSTANTS.help.singleMedalDisclaimer;
            if (this.bottleSpec != null) {
                this.maxStripHeight = this.bottleSpec.recommended.maxHeight;

                this.updateHeightDescription();
                if (this.type == 'Strip medal') {
                    this.updateWidthDescription();
                }
                this.updateOverlapDescription();
            }

            
        },

        methods: {

            // Called when the type of medal is selected
            // Manually sets selection as v-bind is slow
            // Calls updateHeightDescription, updateWidthDescription, updateOverlapDescription
            // selection: the selected type of medal (v-bind is slow so type is manually set)
            selectedType(selection) {
                this.type = selection;

                this.validate('type select');

                this.updateHeightDescription();
                if (this.type == 'Strip medal') {
                    this.updateWidthDescription();
                }
                this.updateOverlapDescription();
            },

            // When clear button is pressed
            // Clears inputs, sets all valid tags to true,
            // Clears all warning strings, sets orange zone to false, sets all inputs to standard-input css
            // Calls: updateWidthDescription, updateHeightDescription and updateOverlapDescription
            clearForm() {
                this.overlapMin = 0;
                this.overlapMax = 0;
                this.overlap = null;
                this.heightOffset = null;
                this.labelsTop = null;

                this.height = null;
                this.width = null;

                this.valid = true;
                this.validHeight = true;
                this.validWidth = true;
                this.validOverlap = true;

                this.warnHeight = null;
                this.warnWidth = null;
                this.warnOverlap = null;

                this.heightWarnClass = '';
                this.widthWarnClass = '';
                this.overlapWarnClass = '';

                this.setInputCss('height', 'standard');
                this.setInputCss('width', 'standard');
                this.setInputCss('overlap', 'standard');

                this.updateWidthDescription();
                this.updateHeightDescription();
                this.updateOverlapDescription();

                this.type = null
            },

            // On key press in input fields
            // Filters any key press that is not 0-9 or 'ArrowRight','ArrowLeft','Backspace', 'Tab'
            // (any filtered key presses are discarded)
            // If key down is 'Tab', force update to fields without timeout (prevents updates being skipped by quick change of field resetting timeout)
            // Note: validate should be called before the overlap description is updated as it checks if the current height
            //  is valid while updating (see updateOverlapDescription for more info)
            // Calls validate
            // Calls updateOverlapDescription (if needed)
            // event: key press event
            keyDown(event) {
                const validKeys = ['ArrowRight','ArrowLeft','Backspace', 'Tab', '-'];
                const keyRegex = /[0-9]/;
                if (!keyRegex.test(event.key) && validKeys.indexOf(event.key) < 0) {
                    event.preventDefault();
                } else if (event.key == 'Tab') {
                    // Todo: check this
                    this.validate(event.path[0].id.split("-")[2]);
                    if (event.path[0].id.split("-")[2] == 'height') {
                        this.updateOverlapDescription();
                    }
                }
            },
            
            // Tiggered on keyup event in the form inputs. Delays action by 500ms to prevent unessacary calling while user is still typing
            // Note: validate should be called before the overlap description is updated as it checks if the current height
            //  is valid while updating (see updateOverlapDescription for more info)
            // Calls validate
            // Calls updateOverlapDescription
            // input: the input that the change has come from 
            inputChange(input) {
                clearTimeout(this.delayTimer);
                this.delayTimer = setTimeout(()=>{
                    this.validate(input);
                    this.updateOverlapDescription();
                }, 500);
            },


            // Updates the display of the current recommended boundry values for max height
            // The heightDescription must be displayed using a v-html directive for the formatting to display propperly (ie <label v-html='textVar'></label>)
            updateHeightDescription() {
                if (this.bottleSpec == null) {
                    this.heightDescription = '';
                } else {
                    if (this.type == "Button medal") {
                        this.heightDescription = CONSTANTS.descriptions.between.replace("${min}", CONSTANTS.data.minLabelHeight).replace("${max}", CONSTANTS.data.maxButtonHeight);
                    } else if (this.type == "Strip medal") {
                        this.heightDescription = CONSTANTS.descriptions.between.replace("${min}", CONSTANTS.data.minLabelHeight).replace("${max}", this.maxStripHeight);
                    }
                }
            },


            // Updates the display of the current recommended boundry values for width
            // The widthDescription must be displayed using a v-html directive for the formatting to display propperly (ie <label v-html='textVar'></label>)
            updateWidthDescription() {
                // Max width can vary with back and front label sizes
                if (this.bottleSpec == null) {
                    this.widthDescription = '';
                } else {
                    this.widthDescription = CONSTANTS.descriptions.between.replace("${min}", CONSTANTS.data.minStripWidth).replace("${max}", CONSTANTS.data.maxStripWidth);
                }
            },

            // Updates the display of the current recommended boundry values for overlap
            // The overlapDescription must be displayed using a v-html directive for the formatting to display propperly (ie <label v-html='textVar'></label>)
            // Only updates if there is a valid height
            // ovarlapMin and overlapMax are derived from the current height and offset of the top label in relation to the label pannel
            updateOverlapDescription() {
                if (!this.validHeight) {
                    return;
                }
                
                if (this.globalPositions.activeLabels.includes('F2')) {
                    const F2 = this.globalPositions.front.F2;
                    if (F2 != null) {
                        this.overlapMax = (F2.height + F2.heightOffset) - this.bottleSpec.recommended.minHeightOffset;
                        this.overlapMin = (F2.height + F2.heightOffset + this.height) - (this.bottleSpec.warning.maxHeight + this.bottleSpec.recommended.minHeightOffset);
                    }
                } else {
                    const F1 = this.globalPositions.front.F1;
                    if (F1 != null) {
                        this.overlapMax = (F1.height + F1.heightOffset) - this.bottleSpec.recommended.minHeightOffset;
                        this.overlapMin = (F1.height + F1.heightOffset + this.height) - (this.bottleSpec.warning.maxHeight + this.bottleSpec.recommended.minHeightOffset);
                    }
                }
                if (this.overlapMin > this.height) {
                    this.overlapMin = this.height;
                }
                this.overlapDescription = CONSTANTS.descriptions.between.replace("${min}", this.overlapMin).replace("${max}", this.overlapMax);
            },

            // Set the provided input to the given setting's css class
            // input: field to be changed {'height', 'width'}
            // setting: {'green', 'orange', 'red', 'standard'}
            setInputCss(input, setting) {
                var inputId = this.labelId + '-input-' + input;

                var element = document.getElementById(inputId);

                if (element == null) {
                    return;
                }

                element.classList.remove("red-input");
                element.classList.remove("green-input");
                element.classList.remove("standard-input");
                this.$nextTick(function () {
                    switch (setting) {
                    case 'green':
                        element.classList.add("green-input");
                        break;
                    case 'red':
                        element.classList.add("red-input");
                        break;
                    case 'standard':
                        element.classList.add("standard-input");
                        break;
                    }
                })
                
                
            },


            // Takes the provided user measurments and validates them against the currently selected spec
            // If a field is blank, validation is skipped and it is considered valid, but it's css class is set to standard-input
            // emits events for valid, invalid and orange zone (warning)
            // Validation details are handeled by helper functions

            // Takes the provided user measurments and validates them against the currently selected spec
            // Calculates current height offset using top of the highest label and medal overlap
            // If a field is blank, validation is skipped and it is considered valid, but it's css class is set to standard-input
            // emits events for valid or invalid
            // Calls: setInputCss
            // Calls: validateHeight, validateOverlap and validateWidth
            validate(input) {
                if (this.type == "Button medal") {
                    this.width = this.height;
                }

                if (this.height == '' || this.height == null) {
                    this.validHeight = true;
                    this.warnHeight = null;
                    this.heightWarnClass = '';
                    this.setInputCss('height', 'standard');
                } else {
                    this.validateHeight();
                }

                if (this.width == '' || this.width == null) {
                    this.validWidth = true;
                    this.warnWidth = null;
                    this.widthWarnClass = '';
                    this.setInputCss('width', 'standard');
                } else {
                    this.validateWidth();
                }

                if (!parseInt(this.overlap)) {
                    this.validOverlap = true;
                    this.warnoverlap = null;
                    this.overlapWarnClass = '';
                    this.setInputCss('overlap', 'standard');
                } else {
                    this.validateOverlap();
                }

                this.valid = this.validHeight && this.validWidth && this.validOverlap;

                if (!(this.overlap && parseInt(this.overlap))) {
                    this.heightOffset = '';
                } else {
                    if (this.globalPositions.activeLabels.includes('F2')) {
                        const F2 = this.globalPositions.front.F2;
                        this.labelsTop = F2.height + F2.heightOffset;
                    } else {
                        const F1 = this.globalPositions.front.F1;
                        this.labelsTop = F1.height + F1.heightOffset;
                    }
                    this.heightOffset = this.labelsTop - this.overlap;
                }
                
                const form = {
                    'height': this.height,
                    'width': this.width,
                    'heightOffset': this.heightOffset,
                    'valid': this.valid,
                    'type': this.type
                };

                // Address "global level" warnings here
                if (!this.valid) {
                    this.$emit('invalid', {'labelId':this.labelId, 'side':'medal', 'type': input});
                } else {
                    this.$emit('valid', {'form':form, 'labelId':this.labelId, 'side':'medal', 'type': input});
                }
            },

            // Checks the validity of the height field and sets validHeight
            // Calls: setInputCss
            // Triggers warnings depending on validity and sets apprepreate warning strings
            validateHeight() {
                var maxHeight;
                if (this.type == "Button medal") {
                    maxHeight = CONSTANTS.data.maxButtonHeight;
                } else if (this.type == "Button medal") {
                    maxHeight = this.maxStripHeight;
                }

                if (this.height < CONSTANTS.data.minLabelHeight) {  // too low
                    this.validHeight = false;
                    this.warnHeight = CONSTANTS.warning.lowHeightWarning;
                    this.heightWarnClass = 'red';
                    this.setInputCss('height', 'red');
                } else if (this.height > maxHeight) { // too high
                    this.validHeight = false;
                    this.warnHeight = CONSTANTS.warning.highHeightWarning;
                    this.heightWarnClass = 'red';
                    this.setInputCss('height', 'red');
                } else { // fine
                    this.validHeight = true;
                    this.warnHeight = null;
                    this.heightWarnClass = '';
                    this.setInputCss('height', 'green');
                }
            },

            // Checks the validity of the width field and sets validWidth
            // Calls: setInputCss
            // Triggers warnings depending on validity and sets apprepreate warning strings
            validateWidth() {
                var minWidth;
                var maxWidth;
                if (this.type == 'Button medal') {
                    minWidth = CONSTANTS.data.minLabelHeight;
                    maxWidth = CONSTANTS.data.maxButtonHeight;
                } else if (this.type == 'Strip medal') {
                    minWidth = CONSTANTS.data.minStripWidth;
                    maxWidth = CONSTANTS.data.maxStripWidth;
                }

                if (this.width < minWidth) { // too narrow
                    this.validWidth = false;
                    this.warnWidth = CONSTANTS.warning.lowWidthWarning;
                    this.widthWarnClass = 'red';
                    this.setInputCss('width', 'red');
                } else if (this.width > maxWidth) { // too wide
                    this.validWidth = false;
                    this.warnWidth = CONSTANTS.warning.highWidthWarning;
                    this.widthWarnClass = 'red';
                    this.setInputCss('width', 'red');
                } else { // fine
                    this.validWidth = true;
                    this.warnWidth = null;
                    this.widthWarnClass = '';
                    this.setInputCss('width', 'green');
                }
            },

            // Checks the validity of the overlap field and sets validOverlap
            // Calls: setInputCss
            // Triggers warnings depending on validity and sets apprepreate warning strings
            validateOverlap() {
                if (this.overlap < this.overlapMin) {  // not enough overlap (sitting too high on the label pannel)
                    this.validOverlap = false;
                    this.warnOverlap = CONSTANTS.warning.lowOverlap;
                    this.overlapWarnClass = 'red';
                    this.setInputCss('overlap', 'red');
                } else if (this.overlap > this.overlapMax) { // too much overlap (medal is sitting too low on the bottle)
                    this.validOverlap = false;
                    this.warnOverlap = CONSTANTS.warning.highOverlap;
                    this.overlapWarnClass = 'red';
                    this.setInputCss('overlap', 'red');
                } else { // fine
                    this.validOverlap = true;
                    this.warnOverlap = null;
                    this.overlapWarnClass = '';
                    this.setInputCss('overlap', 'green');
                }
            }

        }

    }


</script>

<style>

.sub-title-formatted-medal {
    white-space: pre-wrap;
    text-align: left;
    width: 100%;
    font-weight: bold;
    float: left;
    margin-left: 6%;
}

.single-medal-help {
    white-space: pre-wrap;
    text-align: left;
    margin: 2% 4% 1% 4%;
    font-style: italic;
}

</style>