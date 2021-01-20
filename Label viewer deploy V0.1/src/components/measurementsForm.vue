<template>
    <div id=inputs>
        <label class="sub-title-formatted">Height</label>
        <div class='row'>
            <div class='col-sm-5'>
                <input
                    :disabled="!bottleSpec"
                    class="standard-input"
                    :id='labelId+"-input-height"'
                    v-model.number="form.height"
                    required
                    @keyup="inputChange('height')"
                    @keydown="keyDown"
                >
            </div>
            <div class='col-sm-7'>
                <label class="pre-formatted" v-html="heightDescription"></label>
            </div>
        </div>
        <div class="alert alert-danger" role="alert" id='heightCritical' v-if="heightWarnStatus == 'red'">{{ warnHeight }}</div>
        <div class="alert alert-warning" role="alert" id='heightWarning' v-if="heightWarnStatus == 'orange'">{{ warnHeight }}</div>
        <div v-if="heightWarnStatus == 'green'"><br></div>

        <label class="sub-title-formatted">Width</label>
        <div class='row'>
            <div class='col-sm-5'>
                <input
                    :disabled="!bottleSpec"
                    class="standard-input"
                    :id='labelId+"-input-width"'
                    v-model.number="form.width"
                    required
                    @keyup="inputChange('width')"
                    @keydown="keyDown"
                >
            </div>
            <div class='col-sm-7'>
                <label class="pre-formatted" v-html="widthDescription"></label>
            </div>
        </div>
        <div class="alert alert-danger" role="alert" id='widthCritical' v-if="widthWarnStatus == 'red'">{{ warnWidth }}</div>
        <div class="alert alert-warning" role="alert" id='heightOffsetWarning' v-if="widthWarnStatus == 'orange'">{{ warnWidth }}</div>
        <div v-if="widthWarnStatus == 'green'"><br></div>

        <label class="sub-title-formatted">Height from base</label>
        <div class='row'>
            <div class='col-sm-5'>
                <input
                    :disabled="!bottleSpec"
                    class="standard-input"
                    :id='labelId+"-input-heightOffset"'
                    v-model.number="form.heightOffset"
                    required
                    @keyup="inputChange('heightOffset')"
                    @keydown="keyDown"
                >
            </div>
            <div class='col-sm-7'>
                <label class="pre-formatted" v-html="heightOffsetDescription"></label>
            </div>
        </div>
        <div class="alert alert-danger" role="alert" id='heightOffsetCritical' v-if="heightOffsetWarnStatus == 'red'">{{ warnHeightOffset }}</div>
        <div class="alert alert-warning" role="alert" id='heightOffsetWarning' v-if="heightOffsetWarnStatus == 'orange'">{{ warnHeightOffset }}</div>
        <div v-if="heightOffsetWarnStatus == 'green'"><br></div>
    </div>
</template>

<script>
    import CONSTANTS from '../assets/CONSTNATS.json';

    export default {
        name: 'measurementsForm',
        
        props: {
            bottleSpec: {},
            labelId: {
                required: true
            },
            globalPositions: {},
            side: {
                default: 'front',
                type: String,
                validator: function (value) {
                    // The value must match one of these strings
                    return ['front', 'back'].indexOf(value) !== -1;
                }
            }

        },

        watch: {
            bottleSpec: {
                handler() {
                    if (this.bottleSpec != null) {
                        this.validate();
                        this.updateHeightDescription();
                        this.updateHeightOffsetDescription();
                        this.updateWidthDescription();
                    }
                },
                deep: true
            },
            globalPositions: {
                // {'id': labelId, 'side':side, 'type':type}
                // Update for multi label
                handler() {
                    if (this.globalPositions.latest.id != this.labelId) {
                        clearTimeout(this.delayWatcherTimer);
                        this.delayWatcherTimer = setTimeout(()=>{
                            this.updateHeightDescription();
                            this.updateHeightOffsetDescription();
                            this.updateWidthDescription();
                        }, 600);
                    }
                },
                deep: true
            }
        },

        data () {
            return {
                form: {
                    height: '',
                    heightOffset: '',
                    width: ''
                },
                heightDescription: "",
                heightOffsetDescription: "",
                widthDescription: "",
                delayTimer: null,
                valid: true,
                validHeight: true,
                validHeightOffset: true,
                validWidth: true,
                warnHeight: null,
                warnHeightOffset: null,
                warnWidth: null,
                orangeZone: false,
                heightWarnStatus: 'green',
                heightOffsetWarnStatus: 'green',
                widthWarnStatus: 'green'
            }
        },

        mounted() {
        },

        methods: {

            // When clear button is pressed
            // Clears inputs, updates heightOffsetDescription, sets all valid tags to true,
            // clears all warning strings, sets orange zone to false, sets all inputs to standard-input css, sets all warningStatus tags to 'green'
            clearForm() {
                // clear our form values
                this.form.height = '';
                this.form.heightOffset = '';
                this.form.width = '';
                this.updateHeightOffsetDescription();
                this.validHeight = true;
                this.validHeightOffset = true;
                this.validWidth = true;
                this.valid = true;
                this.warnHeight = null;
                this.warnHeightOffset = null;
                this.warnWidth = null;
                this.orangeZone = false;
                this.setInputCss('height', 'standard');
                this.setInputCss('heightOffset', 'standard');
                this.setInputCss('width', 'standard');
                this.heightWarnStatus = 'green';
                this.heightOffsetWarnStatus = 'green';
                this.widthWarnStatus = 'green';
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
                    this.validate(event.path[0].id.split("-")[2]);
                    if (event.path[0].id.split("-")[2] == 'height') {
                        this.updateHeightOffsetDescription();
                        this.updateWidthDescription();
                    }
                }
            },
            
            // Tiggered on keyup event in the form inputs. Delays action by 500ms to prevent unessacary calling while user is still typing
            // Input is the field that has been modified, this function can be expanded for more input, but the validate should be called before the height offset 
            // and width descriptions are updated as they check if the current height is valid while updating (see updateHeightOffsetDescription for more info)
            inputChange(input) {
                clearTimeout(this.delayTimer);
                this.delayTimer = setTimeout(()=>{
                    this.validate(input);
                    if (input == 'height') {
                        this.updateHeightOffsetDescription();
                        this.updateWidthDescription();
                    }
                }, 500);
            },


            // Updates the display of the current recomended boundry values for max height
            // The heightDescription must be displayed using a v-html directive for the formatting to display propperly (ie <label v-html='textVar'></label>)
            updateHeightDescription() {
                if (this.bottleSpec == null) {
                    this.heightDescription = '';
                } else {
                    // Min height is a constant, but max height will vary with height offset and potential addition labels
                    var maxHeightRecomended = this.getMaxHeight('recomended');

                    if (maxHeightRecomended <= CONSTANTS.minLabelHeight) {
                        this.heightDescription = `Recomended <b><b>${CONSTANTS.minLabelHeight}mm</b></b>`;
                    } else {
                        this.heightDescription = `Recomended between <b><b>${CONSTANTS.minLabelHeight}mm</b></b> and <b><b>${maxHeightRecomended}mm</b></b>`;
                    }
                }
            },


            // Updates the display of the current recomended boundry values for max height offset
            // The heightOffsetDescription must be displayed using a v-html directive for the formatting to display propperly (ie <label v-html='textVar'></label>)
            // This description will only update if the height is valid due to the use of the height in calculating max height offset
            updateHeightOffsetDescription() {
                if (this.bottleSpec == null || !this.validHeight) {
                    this.heightOffsetDescription = '';
                } else {
                    if (this.validHeight) {
                        const maxHeightoffsetRecomended = this.getMaxHeightOffset('recomended');
                        const maxHeightoffsetWarning = this.getMaxHeightOffset('warning');

                        if (maxHeightoffsetRecomended <= this.bottleSpec.recomended.minHeightOffset) {
                            if (maxHeightoffsetWarning <= this.bottleSpec.recomended.minHeightOffset) {
                                this.heightOffsetDescription = `Recomended <b><b>${maxHeightoffsetWarning}mm</b></b>`;
                            } else {
                                this.heightOffsetDescription = `Recomended <b><b>${this.bottleSpec.recomended.minHeightOffset}mm</b></b>`;
                            }
                        } else {
                            this.heightOffsetDescription = `Recomended between <b><b>${this.bottleSpec.recomended.minHeightOffset}mm</b></b> and <b><b>${maxHeightoffsetRecomended}mm</b></b>`;
                        }
                    }
                }
            },


            // Updates the display of the currentrecomended boundry values for width
            // The widthDescription must be displayed using a v-html directive for the formatting to display propperly (ie <label v-html='textVar'></label>)
            updateWidthDescription() {
                // Max width can vary with back and front label sizes
                if (this.bottleSpec == null) {
                    this.widthDescription = '';
                } else {
                    var maxWidthRecomended = this.getMaxWidth('recomended');
                    this.widthDescription = `Recomended between <b><b>${CONSTANTS.minLabelWidth}mm</b></b> and <b><b>${maxWidthRecomended}mm</b></b>`;
                }
            },


            // Todo: add multi label support into calcualtions
            // Will likely need to store global max height?
            // Will need seperate sections for front and back label (add additional tag like type?)

            // Fetches the maximum possible height of the label using the type to specify which max height to use
            // Type: {'warning', 'recomended'}
            getMaxHeight(type) {
                var maxHeight;

                if (type == 'warning') {
                    // account for slope section
                    maxHeight = this.bottleSpec.warning.maxHeight
                } else if (type == 'recomended') {
                    maxHeight = this.bottleSpec.recomended.maxHeight
                }
                return maxHeight;
            },


            // Todo: add multi label supprot
            // Max height can cover some of this but will need to look for overlap (dedicated function?)
            // Front and back label will need to be done seperately (additional tag like type?)

            // Fetches the maximum possible height offset of the label using type to specify which max height offset to use
            // The max height offset takes the current label height entered by the user or the minimum label height into account (depending which is bigger)
            // Type: {'warning', 'recomended'}
            getMaxHeightOffset(type) {
                var maxHeightoffset;
                if (type == 'warning') {
                    // account for slope section
                    maxHeightoffset = this.bottleSpec.warning.maxHeight + this.bottleSpec.warning.minHeightOffset - CONSTANTS.minLabelHeight;
                } else if (type == 'recomended') {
                    maxHeightoffset = this.bottleSpec.recomended.maxHeight + this.bottleSpec.recomended.minHeightOffset - CONSTANTS.minLabelHeight;
                }
                if (this.form.height !== null && this.form.height >= CONSTANTS.minLabelHeight) {
                    maxHeightoffset -= this.form.height - CONSTANTS.minLabelHeight;
                }

                return maxHeightoffset;
            },


            // Todo: Add multi label support
            // Confirm min label gap info

            // Fecthes the maximum possible width of the label using type to specify which max width to fetch
            // Accounts for width of labels on the other side of the bottle
            // Accounts for slope at top of orange zone
            // Wrap around definition is considered a maximum limit of the back label
            // When multiple constraints are all relavent (ie, constrained by another label and by height of label) the minimum value is taken
            // Type: {'warning', 'recomended'}
            getMaxWidth(type) {
                var heightAccountedMax = this.bottleSpec.warning.maxWidth;
                if (this.side == 'back' && this.globalPositions.front.maxWidth != null) { // If back label, account for front label width
                    var sideAccountedMax;
                    if (type == 'warning') {
                        // account for slope section
                        if (this.validateHeight && this.form.height != '') {
                            const warningInfo = this.bottleSpec.warning;
                            heightAccountedMax = ( (this.form.height - warningInfo.UpointY) * ( (warningInfo.VpointX - warningInfo.maxWidth)/(warningInfo.maxHeight - warningInfo.UpointY) ) ) + warningInfo.maxWidth;
                        }
                        
                        sideAccountedMax = this.bottleSpec.circumference - (2 * CONSTANTS.minLabelGap.warning) - Math.round(this.globalPositions.front.maxWidth.width);
                        const wrapAroundBoundry = CONSTANTS.warpAroundDef * this.bottleSpec.circumference;
                        
                        return Math.min(sideAccountedMax, heightAccountedMax, this.bottleSpec.warning.maxWidth, wrapAroundBoundry);

                    } else if (type == 'recomended') {
                        sideAccountedMax = this.bottleSpec.circumference - (2 * CONSTANTS.minLabelGap.recomended) - Math.round(this.globalPositions.front.maxWidth.width);
                        return Math.min(sideAccountedMax, this.bottleSpec.recomended.maxWidth);
                    }
                } else {        // If not back label or no front label yet
                    if (type == 'warning') {
                        const warningInfo = this.bottleSpec.warning;
                        // account for slope section
                        if (this.validateHeight && this.form.height != '') {
                            
                            heightAccountedMax = ( (this.form.height - warningInfo.UpointY) * ( (warningInfo.VpointX - warningInfo.maxWidth)/(warningInfo.maxHeight - warningInfo.UpointY) ) ) + warningInfo.maxWidth;
                        }
                        
                        return Math.min(heightAccountedMax, this.bottleSpec.warning.maxWidth);

                    } else if (type == 'recomended') {
                        return this.bottleSpec.recomended.maxWidth;
                    }
                }
            },

            // Set the provided input to the given setting's css class
            // input: field to be changed {'height', 'heightOffset', 'width'}
            // setting: {'green', 'orange', 'red', 'standard'}
            setInputCss(input, setting) {
                var inputId = this.labelId + '-input-' + input;

                document.getElementById(inputId).classList.remove("orange-input");
                document.getElementById(inputId).classList.remove("red-input");
                document.getElementById(inputId).classList.remove("green-input");
                document.getElementById(inputId).classList.remove("standard-input");
                this.$nextTick(function () {
                    switch (setting) {
                    case 'green':
                        document.getElementById(inputId).classList.add("green-input");
                        break;
                    case 'orange':
                        document.getElementById(inputId).classList.add("orange-input");
                        break;
                    case 'red':
                        document.getElementById(inputId).classList.add("red-input");
                        break;
                    case 'standard':
                        document.getElementById(inputId).classList.add("standard-input");
                        break;
                    }
                })
                
                
            },


            // Todo: add multi label support
            // Maybe break this up into smaller helper function for easy of understanding and to be able to reuse stuff???

            // Takes the provided user measurments and validates them against the currently selected spec
            // If a field is blank, validation is skipped and it is considered valid, but it's css class is set to standard-input
            // emits events for valid, invalid and orange zone (warning)
            // Validation details are handeled by helper functions
            validate(input) {
                this.orangeZone = false;

                if (this.form.height == '' || this.form.height == null) {
                    this.validHeight = true;
                    this.warnHeight = null;
                    this.heightWarnStatus = 'green';
                    this.setInputCss('height', 'standard');
                } else {
                    this.validateHeight();
                }
                
                if (this.form.heightOffset == '' || this.form.heightOffset == null) {
                    this.validHeightOffset = true;
                    this.warnHeightOffset = null;
                    this.heightOffsetWarnStatus = 'green';
                    this.setInputCss('heightOffset', 'standard');
                } else {
                    this.validateHeightOffset();
                }

                if (this.form.width == '' || this.form.width == null) {
                    this.validWidth = true;
                    this.warnWidth = null;
                    this.widthWarnStatus = 'green';
                    this.setInputCss('width', 'standard');
                } else {
                    this.validateWidth();
                }

                this.valid = this.validHeight && this.validHeightOffset && this.validWidth;

                // Address "global level" warnings here
                if (!this.valid) {
                    this.$emit('invalid', {'labelId':this.labelId, 'side':this.side, 'type': input});
                } else {
                    this.$emit('valid', {'form':this.form, 'labelId':this.labelId, 'side':this.side, 'type': input});
                }
                if (this.orangeZone) {
                    this.$emit('warning', {'warning':'orange zone', 'labelId':this.labelId, 'side':this.side, 'type': input, 'form':this.form});
                }
            },

            // Checks the validity of the height field and sets validHeight, changes css setting of input and triggers warnings depending on validity
            validateHeight() {
                if (this.form.height < CONSTANTS.minLabelHeight) {  // too low
                    this.validHeight = false;
                    this.warnHeight = 'Label height is bellow the minimum applyable height';
                    this.heightWarnStatus = 'red';
                    this.setInputCss('height', 'red');
                } else if (this.form.height > this.getMaxHeight('recomended') && this.form.height <= this.getMaxHeight('warning')) { // warn
                    this.orangeZone = true;
                    this.validHeight = true;
                    this.warnHeight = 'Label may have issues in application';
                    this.heightWarnStatus = 'orange';
                    this.setInputCss('height', 'orange');
                } else if (this.form.height > this.getMaxHeight('warning')) { // too high
                    this.validHeight = false;
                    this.warnHeight = 'Label exceeds the maximum allowable height';
                    this.heightWarnStatus = 'red';
                    this.setInputCss('height', 'red');
                } else { // fine
                    this.validHeight = true;
                    this.warnHeight = null;
                    this.heightWarnStatus = 'green';
                    this.setInputCss('height', 'green');
                }
            },

            // Checks the validity of the height field and sets validHeightOffset, changes css setting of input and triggers warnings depending on validity
            validateHeightOffset() {
                if (!this.validHeight) {
                    this.setInputCss('heightOffset', 'standard');
                    this.heightOffsetWarnStatus = 'green';
                    return;
                }
                if (this.form.heightOffset < this.bottleSpec.warning.minHeightOffset) { // too low
                    this.validHeightOffset = false;
                    this.warnHeightOffset = 'Label height offset is too low';
                    this.heightOffsetWarnStatus = 'red';
                    this.setInputCss('heightOffset', 'red');
                } else if ((this.form.heightOffset > this.getMaxHeightOffset('recomended') && this.form.heightOffset <= this.getMaxHeightOffset('warning')) ||
                            (this.form.heightOffset < this.bottleSpec.recomended.minHeightOffset && this.form.heightOffset >= this.bottleSpec.warning.minHeightOffset)) { // warn
                    this.orangeZone = true;
                    this.validHeightOffset = true;
                    this.warnHeightOffset = 'Label may have application issues';
                    this.heightOffsetWarnStatus = 'orange';
                    this.setInputCss('heightOffset', 'orange');
                } else if (this.form.heightOffset > this.getMaxHeightOffset('warning')) { // too high
                    this.validHeightOffset = false;
                    this.warnHeightOffset = 'Label is set too high';
                    this.heightOffsetWarnStatus = 'red';
                    this.setInputCss('heightOffset', 'red');
                } else { // fine
                    this.validHeightOffset = true;
                    this.warnHeightOffset = null;
                    this.heightOffsetWarnStatus = 'green';
                    this.setInputCss('heightOffset', 'green');
                }
            },

            // Checks the validity of the width field and sets validHeightOffset, changes css setting of input and triggers warnings depending on validity
            validateWidth() {
                if (this.form.width < CONSTANTS.minLabelWidth) { // too narrow
                    this.validWidth = false;
                    this.warnWidth = 'Label is too narrow';
                    this.widthWarnStatus = 'red';
                    this.setInputCss('width', 'red');
                } else if (this.form.width > this.getMaxWidth('recomended') && this.form.width <= this.getMaxWidth('warning')) { // warn
                    this.orangeZone = true;
                    this.validWidth = true;
                    this.warnWidth = 'Label may have application issues';
                    this.widthWarnStatus = 'orange';
                    this.setInputCss('width', 'orange');
                } else if (this.form.width > this.getMaxWidth('warning')) { // too wide
                    this.validWidth = false;
                    this.warnWidth = 'Label is too wide';
                    this.widthWarnStatus = 'red';
                    this.setInputCss('width', 'red');
                } else { // fine
                    this.validWidth = true;
                    this.warnWidth = null;
                    this.widthWarnStatus = 'green';
                    this.setInputCss('width', 'green');
                }
            }

        }

    }


</script>

<style>
.pre-formatted {
  white-space: pre-wrap;
  padding: 5px;
  width: 90%;
  font-size: 75%;
}

.sub-title-formatted {
    white-space: pre-wrap;
    width: 100%;
    font-weight: bold;
}

.standard-input {
    width: 100%;
    padding: 6%;
    border: 1px solid lightgrey;
    border-radius: 8px;
    font-size: 120%;
    outline-width: 3px;
    outline-color: darkgrey;
}

.green-input {
    width: 100%;
    padding: 6%;
    border: 3px solid green;
    border-radius: 8px;
    font-size: 120%;
    outline-width: 3px;
    outline-color: darkgrey;
}

.orange-input {
    width: 100%;
    padding: 6%;
    border: 3px solid orange;
    border-radius: 8px;
    font-size: 120%;
    outline-width: 3px;
    outline-color: darkgrey;
}

.red-input {
    width: 100%;
    padding: 6%;
    border: 3px solid red;
    border-radius: 8px;
    font-size: 120%;
    outline-width: 3px;
    outline-color: darkgrey;
}
</style>