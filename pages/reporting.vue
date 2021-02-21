<template>
  <b-container fluid class="pt-3">

    <h1 class="h2 mb-4">Reporting</h1>

    <b-card class="mb-4">

      <h2 class="h3">1. Province and Date</h2>
    
      <b-form-group label="Province" class="province-select">
        <span v-for="(province, index) in provinces"
              v-bind:key="index"
              class="mr-1">
          <b-button v-on:click="setProvince(index)"
                    v-bind:variant="isSelected(province.code)"
                    v-bind:disabled="reportLoaded"
                    v-bind:title="province.name">
          {{ province.code }}</b-button></span>
      </b-form-group>

      <b-form-group label="Date" class="w-50 mb-3">
        <b-form-datepicker :min="dateOptions.min"
                           :max="dateOptions.max"
                           v-model="form.date"
                           v-bind:disabled="reportLoaded"></b-form-datepicker>
      </b-form-group>

      <b-button v-on:click="loadReport()"
                v-if="! reportLoaded"
                v-bind:disabled="selectedProvince === null"
                variant="primary">Load Report</b-button>

    </b-card>

    <b-card v-if="reportLoaded">

      <div class="h5">
        <b-badge v-on:click="resetReport()"
                 v-if="reportLoaded"
                 class="align-top fs-6"
                 href="#"
                 variant="warning">Select a different Province or Date</b-badge>
      </div>

      <h2 class="my-4">
        <span class="h3">2. Reports</span>
      </h2>

      <h3 class="h4 mb-4">Province: <span class="bg-light">{{ provinces[selectedProvince].name }}</span></h3>

      <div class="row mb-4">
        <div class="col col-sm-6 col-md-4">
          <label class="form-label">Data Status</label>
          <b-form-select v-model="form.status" :options="statusOptions" size="sm"></b-form-select>
          <em><small>*current</small></em>
        </div>
      </div>

      <b-table-simple fixed striped bordered class="report-table">
        <b-thead head-variant="dark">
          <b-tr>
            <b-th v-for="(attr, index) in reportAttrs" v-bind:key="index"><span class="thh">{{ attr }}</span></b-th>
          </b-tr>
        </b-thead>
        <b-tbody>
          <b-tr>
            <b-th v-for="(attr, key) in reportAttrs" v-bind:key="key">
              <b-input type="number" size="sm" min="0" v-model="report[key]" />
            </b-th>
          </b-tr>
        </b-tbody>
      </b-table-simple>

      <b-spinner label="Loading report" v-if="loading"></b-spinner>

      <h3 class="h4">Health Regions</h3>

      <b-table-simple fixed striped bordered v-if="regions && !loading" class="report-table report-table-th">
        <b-thead head-variant="dark">
          <b-tr>
            <b-th>&nbsp;</b-th>
            <b-th v-for="(attr, index) in hrReportAttrs" v-bind:key="index">{{ attr }}</b-th>
          </b-tr>
        </b-thead>
        <b-tbody>
          <b-tr v-for="region in regions" v-bind:key="region.hr_uid">
            <b-th>
              {{ region.engname }}<br/>
              <small>{{ region.hr_uid }}</small>
            </b-th>
            <b-th v-for="(attr, key) in hrReportAttrs" v-bind:key="key">
              <b-input type="number" size="sm" min="0" v-model="hrReports[region.hr_uid][key]" />
            </b-th>
          </b-tr>
        </b-tbody>
      </b-table-simple>

      <b-button v-on:click="saveReport()"
                v-bind:disabled="saving"
                variant="primary">Save Report</b-button>

      <b-spinner label="Saving report" v-if="saving"></b-spinner>

      <b-alert v-model="alert.show" v-bind:variant="alert.variant || 'info'" dismissible class="mt-3">
        <strong>{{ alert.title }}</strong> {{ alert.description }}
      </b-alert>

    </b-card>

  </b-container>
</template>

<script>
  export default {
    middleware: 'auth',
    data: function() {
      return {
        attrs: {
          'cases': 'Cases',
          'fatalities': 'Fatalities',
          'tests': 'Tests',
          'hospitalizations': 'Hospitalizations',
          'criticals': 'Criticals',
          'recoveries': 'Recoveries',
          'vaccinations': 'Vaccinations',
          'vaccines_distributed': 'Vaccines Dist.',
          'vaccinated': 'Vaccinated',
        },
        baseAttrs: null,
        provinces: [],
        regions: [],
        regionHash: {},
        loading: false,
        selectedProvince: null,
        form: {
          province: null,
          date: null,
          status: null,
        },
        report: {},
        hrReports: {},
        reportLoaded: false,
        statusOptions: [
          '',
          'Waiting for report',
          'In progress',
          'Reported',
          'No report expected today'
        ],
        dateOptions: {
          min: new Date('2020-01-01'),
          max: new Date(),
        },
        saving: false,
        alert: {
          show: false,
          variant: null,
          title: '',
          description: '',
        },
      }
    },
    created() {
      this.loadOptions();
      this.form.date = this.currentDate();
      // zeroed standard attributes
      this.baseAttrs = JSON.parse(JSON.stringify(this.attrs));
      Object.keys(this.baseAttrs).forEach(v => this.baseAttrs[v] = null);
      // reset
      this.resetReport();
    },
    methods: {

      /**
       * loads initial options
       */
      loadOptions() {
        this.$axios.$get('provinces')
          .then(response => {
            if( this.$auth.user.role !== 'admin' ) {
              let whitelist = this.$auth.user.provinces.map( p => p.code );
              this.provinces = response.filter( r => whitelist.includes(r.code ) );
            } else {
              this.provinces = response;
            }
          })
          .catch(errors => {
            console.dir(errors);
          });
      },

      /**
       * helper to pull user Y-m-d
       */
      currentDate() {
        let d = new Date();
        return new Date(d.getTime() - (d.getTimezoneOffset() * 60000 )).toISOString().split("T")[0];
      },

      /**
       * selects a province
       */
      setProvince(index) {
        // assign province
        this.selectedProvince = index;
        this.form.province = this.provinces[index].code;
      },

      /**
       * loads report based on selected province and date
       */
      loadReport() {
        // fetch data from API
        this.$axios.$get(`manage/report/${this.form.province}`, {'params': { 'date': this.form.date }})
          .then(response => {
            // update data status
            this.form.status = response.province.data_status;
            // load province report data
            Object.keys(this.reportAttrs).forEach(attr => {
              // loop through each [expected] key
              if( response.report[attr] !== undefined ) {
                // fill model accordingly
                this.report[attr] = response.report[attr]
              }
            });
            // load regions
            this.regions = response.regions;
            // default attributes (null)
            // create v-model for each region
            this.regions.forEach((r, index) => {
              let defaultHrAttrs = Object.keys(JSON.parse(JSON.stringify(this.hrReportAttrs)))
                                   .reduce((a, k)=> (a[k] = null,a),{});
              this.hrReports[r.hr_uid] = defaultHrAttrs;
              // store index reference
              this.regionHash[r.hr_uid] = index;
            });
            // prefill any existing region data
            if( Array.isArray(response.hr_reports) ) {
              let keys = Object.keys(this.hrReportAttrs);
              // loop through each returned report
              response.hr_reports.forEach(r => {
                // look for attributes we want
                keys.forEach(attr => {
                  if( r[attr] !== undefined && this.hrReports[r.hr_uid] !== undefined ) {
                    this.hrReports[r.hr_uid][attr] = r[attr];
                  }
                });
              });
            }
            // complete
            this.reportLoaded = true;
          })
          .catch(errors => {
            console.dir(errors);
          });
      },

      /**
       * saves current report (post)
       */
      saveReport() {
        this.saving = true;
        this.alert.show = false;
        // prepare payload, start with basic values
        const payload = JSON.parse(JSON.stringify( this.form ));
        // attach province report
        payload.report = JSON.parse(JSON.stringify( this.report ));
        // attach health region reports
        payload.hr_report = JSON.parse(JSON.stringify( this.hrReports ));
        // post
        this.$axios.$post( `manage/report`, payload )
          .then(response => {
            this.alert.variant = 'success';
            this.alert.title = response.message;
            this.alert.description = `(${response.province}, ${response.date})`;
            this.alert.show = true;
            // done
            this.saving = false;
          })
          .catch(error => {
            this.alert.variant = 'danger';
            this.alert.show = true;
            this.alert.title = '';
            this.alert.description = error.response.data.message;
            this.saving = false;
          });
      },

      /**
       * checks if code matches selected province
       */
      isSelected(code) {
        return this.form.province === code ? 'primary' : 'outline-secondary';
      },

      /**
       * helper to reset the report form (changing province/date)
       */
      resetReport() {
        this.report = JSON.parse(JSON.stringify(this.baseAttrs));
        this.hrReports = {};
        this.form.status = null;
        this.reportLoaded = false;
        this.regionHash = {};
      },
    },
    computed: {
      reportAttrs() {
        let { ...attrs } = this.attrs;
        return attrs;
      },
      hrReportAttrs() {
        let { vaccines_distributed, ...attrs } = this.attrs;
        return attrs;
      },
    },
  }
</script>

<style>

  .report-table-th th:first-child {
    text-align: right;
  }

  .province-select .btn {
    font-weight: bold;
  }

  .province-select .btn-primary {
    text-decoration: underline;
  }

  /* hide increment arrows */
  input[type=number]::-webkit-inner-spin-button, 
  input[type=number]::-webkit-outer-spin-button { 
    -webkit-appearance: none; 
  }

  input[type=number] {
    -moz-appearance: textfield;
  }

</style>