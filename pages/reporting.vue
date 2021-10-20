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

      <div class="d-flex align-items-center">
        <b-button v-on:click="loadReport()"
                  v-if="! reportLoaded"
                  v-bind:disabled="selectedProvince === null"
                  variant="primary">Load Report</b-button>

        <b-spinner label="Loading report" class="ml-2" v-if="loading"></b-spinner>
      </div>

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
              <b-input type="number" size="sm" min="0" v-bind:title="attr" v-model="report[key]" />
            </b-th>
          </b-tr>
        </b-tbody>
      </b-table-simple>

      <h3 class="h4">Health Regions</h3>

      <b-table-simple fixed striped bordered v-if="regions && !loading" class="report-table report-table-th" v-bind:class="tableCompact ? 'compact' : ''">
        <b-thead head-variant="dark">
          <b-tr>
            <b-th><b-button size="sm" v-on:click="toggleCompact">{{ tableCompact ? '&raquo;' : '&laquo;' }}</b-button></b-th>
            <b-th v-for="(attr, index) in hrReportAttrs" v-bind:key="index">{{ attr }}</b-th>
          </b-tr>
        </b-thead>
        <b-tbody>
          <b-tr v-for="region in regions" v-bind:key="region.hr_uid">
            <b-th>
              <p>{{ region.engname }}</p>
              <small>{{ region.hr_uid }}</small>
            </b-th>
            <b-th v-for="(attr, key) in hrReportAttrs" v-bind:key="key">
              <b-input type="number" size="sm" min="0" v-bind:title="attr" v-model="hrReports[region.hr_uid][key]" />
            </b-th>
          </b-tr>
        </b-tbody>
      </b-table-simple>

      <div v-if="hasVaccineReport">
        <h3 class="h4">Additional Vaccine Reports</h3>
        <b-table-simple fixed striped bordered class="report-v2-table">
          <b-thead head-variant="dark">
            <b-tr>
              <b-th v-for="(value, attr) in report_v2.vaccine_reports.data" :key="attr" class="text-capitalize">{{ attr | formatAttr }}</b-th>
            </b-tr>
          </b-thead>
          <b-tbody>
            <b-tr>
              <b-td v-for="(value, attr) in report_v2.vaccine_reports.data" :key="attr">
                <b-input type="number" size="sm" min="0" v-bind:title="attr" v-model="report_v2.vaccine_reports.data[attr]" />
              </b-td>
            </b-tr>
          </b-tbody>
        </b-table-simple>
      </div>

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
          'boosters_1': 'Boosters 1',
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
        report_v2: {},
        reportLoaded: false,
        tableCompact: false,
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
      // amp
      this.$amplitude.getInstance().logEvent('view_reporting');
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
        this.loading = true;
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
            // v2 report system
            this.report_v2 = response.report_v2;
            // complete
            this.loading = false;
            this.reportLoaded = true;
          })
          .catch(errors => {
            console.dir(errors);
          });
        // amp
        this.$amplitude.getInstance().logEvent('load_report', {'province': this.form.province, 'date': this.form.date});
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
        // custom reports
        if( this.report_v2 ) {
          payload.report_v2 = {};
          Object.keys(this.report_v2).forEach(( report_table ) => {
            let report_data = JSON.parse(JSON.stringify( this.report_v2[report_table] ));
            payload.report_v2[report_table] = report_data.data;
          });
        }
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
        // amp
        this.$amplitude.getInstance().logEvent('save_report', {'province': this.form.province, 'date': this.form.date});
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
        this.report_v2 = {};
      },

      /**
       * constricts/expands first column in hr_reports for smaller viewports
       */
      toggleCompact() {
        this.tableCompact = !this.tableCompact;
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
      hasVaccineReport() {
        return this.report_v2 && this.report_v2.vaccine_reports && this.report_v2.vaccine_reports.enabled;
      },
    },
    filters: {
      formatAttr: function(value) {
        return value.replace(/_/g, ' ');
      },
    },
  }
</script>

<style>

  .report-table-th th:first-child {
    text-align: right;
  }

  .report-table-th th:first-child > p {
    font-size: 0.875rem;
    line-height: 1.25;
    margin-bottom: 0;
  }
  
  .report-table-th.compact th:first-child {
    width: 5ch;
  }

  .report-table-th.compact th:first-child > p {
    display: none;
  }

  .province-select .btn {
    font-weight: bold;
  }

  .province-select .btn-primary {
    text-decoration: underline;
  }

  table.report-v2-table {
    width: auto;
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