<template>
    <div id=inputs class="container-fluid medal-form">
        <hr v-if="labelId[1] > 1">
        <div class="row row-cols-12">
            <div class="col-sm-12">
                <multiselect 
                    class='multi-select'
                    v-model="type" 
                    placeholder="What type of medal do you want?"
                    :close-on-select="true" 
                    :options="['Button medal', 'Strip medal']"
                    :multiple="false"
                    @select="typeSelect"
                    @remove="typeRemove"
                >Medal type</multiselect>
            </div>
        </div>
        <div class="row row-cols-12" v-show="type">
            <div class='col-sm-6'>
                <label v-if="type == 'Button medal'" class="sub-title-formatted">Diameter</label>
                <label v-if="type == 'Strip medal'" class="sub-title-formatted">Height</label>
            </div>
            <div class='col-sm-6' v-show="type == 'Strip medal'">
                <label class="sub-title-formatted">Width</label>
            </div>
        </div>
        <div class="row row-cols-12" v-show="type">
            <div class='col-sm-2'>
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
            <div class='col-sm-4'>
                <label class="pre-formatted" v-html="heightDescription"></label>
            </div>
            <div class='col-sm-2'>
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
            <div class='col-sm-4'>
                <label  v-show="type == 'Strip medal'" class="pre-formatted" v-html="widthDescription"></label>
            </div>
        </div>
        <br>
        <div class="row row-cols-12">
            <div class="col-sm-6">
                <label v-if="type" class="sub-title-formatted">Horizontal placement</label>
                <label v-else class="sub-title-formatted dissabled-text">Horizontal placement</label>
            </div>
            <div class="col-sm-6">
                <label v-if="type" class="sub-title-formatted">Vertical placement</label>
                <label v-else class="sub-title-formatted dissabled-text">Vertical placement</label>
            </div>
        </div>
        <div class='row row-cols-12' >
            <div class='col-sm-5'>
                <div class="slidecontainer">
                    <input 
                        type="range" 
                        min="0" 
                        :max="100" 
                        value=0 
                        class="slider dissabled-slider"
                        id="horizontalSlider"
                        @input="sliderInput"
                        >
                </div>
            </div>
            <div class="col-sm-1">
                <label class="sub-title-formatted">{{ HPlacement }}</label>
            </div>

            <div class='col-sm-5'>
                <div class="slidecontainer">
                    <input 
                        type="range" 
                        min="0" 
                        :max="100" 
                        value=0
                        class="slider dissabled-slider"
                        id="verticalSlider"
                        @input="sliderInput">
                </div>
            </div>
            <div class="col-sm-1">
                <label class="sub-title-formatted">{{ VPlacement }}</label>
            </div>
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
                        this.validate();
                        this.updateHeightDescription();
                        this.updateWidthDescription();
                        this.updateSliders();
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

                                    this.updateWidthDescription();
                                    this.updateHeightDescription();
                                    this.updateSliders();
                                } else if (ID == 'F1') {
                                    this.validate('props');

                                    this.updateWidthDescription();
                                    this.updateHeightDescription();
                                    this.updateSliders();
                                }
                            }
                        }, 600);
                    }
                },
                deep: true
            }
        },

        computed: {
            HPlacement: function() {
                return this.HPlacementMax * this.HSliderPlacement / 100;
            },
            VPlacement: function() {
                return this.VPlacementMax * this.VSliderPlacement / 100;
            }
        },

        data () {
            return {
                type: null,
                height: '',
                width: '',
                heightDescription: "",
                widthDescription: "",
                delayTimer: null,
                valid: true,
                validHeight: true,
                validWidth: true,
                warnHeight: null,
                warnWidth: null,
                heightWarnClass: '',
                widthWarnClass: '',
                queue: [],

                HSliderPlacement: 0,
                HPlacementMax: 0,
                VSliderPlacement: 0,
                VPlacementMax: 0,
            }
        },

        mounted() {
            if (this.bottleSpec != null) {
                this.updateHeightDescription();
                if (this.type == 'Strip medal') {
                    this.updateWidthDescription();
                }
                this.updateSliders();
            }
        },

        methods: {

            typeSelect() {
                document.getElementById('verticalSlider').classList.remove("dissabled-slider");
                document.getElementById('horizontalSlider').classList.remove("dissabled-slider");
            },

            typeRemove() {
                document.getElementById('verticalSlider').classList.add("dissabled-slider");
                document.getElementById('horizontalSlider').classList.add("dissabled-slider");
            },

            sliderInput(input) {
                if (input.target.id == 'verticalSlider') {
                    this.VSliderPlacement = input.target.value;
                }
                if (input.target.id == 'horizontalSlider') {
                    this.HSliderPlacement = input.target.value;
                }
            },

            // When clear button is pressed
            // Clears inputs, sets all valid tags to true,
            // clears all warning strings, sets orange zone to false, sets all inputs to standard-input css
            clearForm() {
                this.HSliderPlacement = 0,
                this.VSliderPlacement = 0,

                this.height = null,
                this.width = null,

                this.valid = true,
                this.validHeight = true,
                this.validWidth = true,
                this.warnHeight = null,
                this.warnWidth = null,
                this.heightWarnClass = '',
                this.widthWarnClass = ''

                this.setInputCss('height', 'standard');
                this.setInputCss('width', 'standard');

                this.type = null,
                document.getElementById('verticalSlider').classList.add("dissabled-slider");
                document.getElementById('horizontalSlider').classList.add("dissabled-slider");
            },

            // On key press in input fields
            // Filters any key press that is not 0-9 or 'ArrowRight','ArrowLeft','Backspace', 'Tab'
            // (any filtered key presses are discarded)
            // if key down is 'Tab', force update to fields without timeout (prevents updates being skipped by quick change of field resetting timeout)
            keyDown() {
                const validKeys = ['ArrowRight','ArrowLeft','Backspace', 'Tab'];
                const keyRegex = /[0-9]/;
                if (!keyRegex.test(event.key) && validKeys.indexOf(event.key) < 0) {
                    event.preventDefault();
                } else if (event.key == 'Tab') {
                    // Todo: check this
                    this.validate(event.path[0].id.split("-")[2]);
                    if (event.path[0].id.split("-")[2] == 'height') {
                        this.updateHeightDescription();
                        if (this.type == 'Strip medal') {
                            this.updateWidthDescription();
                        }
                        this.updateSliders();
                    }
                }
            },
            
            // Tiggered on keyup event in the form inputs. Delays action by 500ms to prevent unessacary calling while user is still typing
            // Input is the field that has been modified, this function can be expanded for more input
            inputChange(input) {
                clearTimeout(this.delayTimer);
                this.delayTimer = setTimeout(()=>{
                    this.updateSliders();
                    this.validate(input);
                }, 500);
            },


            // Updates the display of the current recomended boundry values for max height
            // The heightDescription must be displayed using a v-html directive for the formatting to display propperly (ie <label v-html='textVar'></label>)
            updateHeightDescription() {
                if (this.bottleSpec == null) {
                    this.heightDescription = '';
                } else {
                    this.heightDescription = `Recomended between <b><b>${CONSTANTS.minLabelHeight}mm</b></b> and <b><b>${CONSTANTS.maxMedalHeight}mm</b></b>`;
                }
            },


            // Updates the display of the current recomended boundry values for width
            // The widthDescription must be displayed using a v-html directive for the formatting to display propperly (ie <label v-html='textVar'></label>)
            updateWidthDescription() {
                // Max width can vary with back and front label sizes
                if (this.bottleSpec == null) {
                    this.widthDescription = '';
                } else {
                    this.widthDescription = `Recomended between <b><b>${CONSTANTS.minStripWidth}mm</b></b> and <b><b>${CONSTANTS.maxStripWidth}mm</b></b>`;
                }
            },


            updateSliders() {
                if (this.globalPositions.activeLabels.includes('F2')) {
                    const F2 = this.globalPositions.front.F2;
                    if (F2 != null) {
                        this.HPlacementMax = F2.width + 2 * this.height - this.width;
                        this.VPlacementMax = F2.height + (F2.heightOffset - this.bottleSpec.recomended.minHeightOffset);
                    }
                } else {
                    const F1 = this.globalPositions.front.F1;
                    if (F1 != null) {
                        this.HPlacementMax = F1.width + 2 * this.height - this.width;
                        this.VPlacementMax = F1.height + (F1.heightOffset - this.bottleSpec.recomended.minHeightOffset);
                    }
                }
            
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
            validate(input) {
                if (this.type == "Button medal") {
                    this.width - this.height;
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

                this.valid = this.validHeight && this.validWidth;

                // todo: send placement info
                const form = {
                    'height': this.height,
                    'width': this.width,
                    'valid': this.valid,
                    'HPlacement': this.HPlacement,
                    'VPlacement': this.VPlacement,
                    'type': this.type
                };

                // Address "global level" warnings here
                if (!this.valid) {
                    this.$emit('invalid', {'labelId':this.labelId, 'side':'medal', 'type': input});
                } else {
                    this.$emit('valid', {'form':form, 'labelId':this.labelId, 'side':'medal', 'type': input});
                }
            },

            // Checks the validity of the height field and sets validHeight, changes css setting of input and triggers warnings depending on validity
            validateHeight() {
                if (this.height < CONSTANTS.minLabelHeight) {  // too low
                    this.validHeight = false;
                    this.warnHeight = CONSTANTS.lowHeightWarning;
                    this.heightWarnClass = 'red';
                    this.setInputCss('height', 'red');
                } else if (this.height > CONSTANTS.maxMedalHeight) { // too high
                    this.validHeight = false;
                    this.warnHeight = CONSTANTS.highHeightWarning;
                    this.heightWarnClass = 'red';
                    this.setInputCss('height', 'red');
                } else { // fine
                    this.validHeight = true;
                    this.warnHeight = null;
                    this.heightWarnClass = '';
                    this.setInputCss('height', 'green');
                }
            },

            // Checks the validity of the width field and sets validWidth, changes css setting of input and triggers warnings depending on validity
            validateWidth() {
                var minWidth;
                var maxWidth;
                if (this.type == 'Button medal') {
                    minWidth = CONSTANTS.minLabelHeight;
                    maxWidth = CONSTANTS.maxMedalHeight;
                } else if (this.type == 'Strip medal') {
                    minWidth = CONSTANTS.minStripWidth;
                    maxWidth = CONSTANTS.maxStripWidth;
                }

                if (this.width < minWidth) { // too narrow
                    this.validWidth = false;
                    this.warnWidth = CONSTANTS.lowWidthWarning;
                    this.widthWarnClass = 'red';
                    this.setInputCss('width', 'red');
                } else if (this.width > maxWidth) { // too wide
                    this.validWidth = false;
                    this.warnWidth = CONSTANTS.highWidthWarning;
                    this.widthWarnClass = 'red';
                    this.setInputCss('width', 'red');
                } else { // fine
                    this.validWidth = true;
                    this.warnWidth = null;
                    this.widthWarnClass = '';
                    this.setInputCss('width', 'green');
                }
            }

        }

    }


</script>

<style>

.medal-form {
    padding: 3%;
}

.form {
    margin: 2%;
}

.dotted {
    border-style: dotted;
}

.pre-formatted {
    white-space: pre-wrap;
    padding: 5px;
    width: 90%;
    font-size: 75%;
}

.sub-title-formatted {
    white-space: pre-wrap;
    text-align: left;
    margin-left: 6%;
    width: 100%;
    font-weight: bold;
}

.dissabled-text {
    opacity: 0.7;
}

.standard-input {
    float: left;
    margin-left: 5%;
    width: 80px;
    padding: 6%;
    border: 1px solid lightgrey;
    border-radius: 8px;
    font-size: 120%;
    outline-width: 3px;
    outline-color: darkgrey;
}

.green-input {
    float: left;
    margin-left: 6%;
    width: 80px;
    padding: 6%;
    border: 3px solid green;
    border-radius: 8px;
    font-size: 120%;
    outline-width: 3px;
    outline-color: darkgrey;
    border-color: #28a745;
    padding-right: calc(1.5em + 0.75rem);
    background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="%2328a745" class="bi bi-check2" viewBox="0 0 16 16"><path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/></svg>');
    background-repeat: no-repeat;
    background-size: 2rem 2.1rem;
    background-position: right 0.1rem center;
    min-width: 90px;
}

.red-input {
    float: left;
    margin-left: 5%;
    width: 80px;
    padding: 6%;
    border: 3px solid red;
    border-radius: 8px;
    font-size: 120%;
    outline-width: 3px;
    outline-color: darkgrey;

    background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" fill="%23FF0000" class="bi bi-x" viewBox="0 0 16 16"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/></svg>');
    background-repeat: no-repeat;
    background-size: 2rem 3rem;
    background-position: right 0rem center;
    min-width: 90px;
}


.tooltip {
    display: block !important;
    z-index: 10000;
}

.tooltip .tooltip-inner {
    background: none;
    color: white;
    border-radius: 16px;
    font-size: 110%;
}

.red {
    background: rgb(255, 45, 45);
    border-radius: 16px;
    padding: 15px;
}

.tooltip[x-placement^="right"] {
    margin-left: 5px;
}

.tooltip[aria-hidden='true'] {
    visibility: hidden;
    opacity: 0;
    transition: opacity .15s, visibility .15s;
}

.tooltip[aria-hidden='false'] {
    visibility: visible;
    opacity: 1;
    transition: opacity .15s;
}


.slidecontainer {
    width: 100%; /* Width of the outside container */
}

/* The slider itself */
.slider {
    -webkit-appearance: none;  /* Override default CSS styles */
    appearance: none;
    width: 100%; /* Full-width */
    height: 15px; /* Specified height */
    border-radius: 7px;
    background: #d3d3d3; /* Grey background */
    outline: none; /* Remove outline */
    opacity: 0.7; /* Set transparency (for mouse-over effects on hover) */
    -webkit-transition: .2s; /* 0.2 seconds transition on hover */
    transition: opacity .2s;
}

/* Mouse-over effects */
.slider:hover {
    opacity: 1; /* Fully shown on mouse-over */
}

/* The slider handle (use -webkit- (Chrome, Opera, Safari, Edge) and -moz- (Firefox) to override default look) */
.slider::-webkit-slider-thumb {
    -webkit-appearance: none; /* Override default look */
    appearance: none;
    width: 25px; /* Set a specific slider handle width */
    height: 25px; /* Slider handle height */
    border-radius: 50%;
    background: #4CAF50; /* Green background */
    cursor: pointer; /* Cursor on hover */
}

.slider::-moz-range-thumb {
    width: 25px; /* Set a specific slider handle width */
    height: 25px; /* Slider handle height */
    background: #4CAF50; /* Green background */
    cursor: pointer; /* Cursor on hover */
}

.dissabled-slider {
    pointer-events:none;
}

</style>