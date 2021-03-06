var RBS = ReactBootstrap;

/*
 * For design outline, see README.
 */

var preset_elections = {};

var Client = (function () {
  const PATH_CAPABILITIES = '/api/capabilities/';

  function getCapabilities(cb) {
    return fetch(`${PATH_CAPABILITIES}`, {
      accept: 'application/json',
    }).then(checkStatus)
      .then(parseJSON)
      .then(cb);
  }

  function checkStatus(response) {
    if (response.status >= 200 && response.status < 300) {
      return response;
    } else {
      const error = new Error(`HTTP Error ${response.statusText}`);
      error.status = response.statusText;
      error.response = response;
      //console.log(error);
      throw error;
    }
  }

  function parseJSON(response) {
    ////console.log(response.json())
    return response.json();
  }

  return {
    getCapabilities: getCapabilities
  }
})();

var VotesConstituency = React.createClass({
    remove: function() {
        this.props.removeConstituency(this.props.constituency.id);
    },
    setName: function(e) {
        this.props.setConstituencyName(this.props.constituency.id, e.target.value);
    },
    setPartyVotes: function(e) {
        this.props.setPartyVotes(this.props.constituency.id, e.target.dataset.party, e.target.value)
    },
    getPartyVotes: function(party) {
        ////console.log("getPartyVotes:", this.props);
        for (var vote in this.props.constituency.votes) {
            if (this.props.constituency.votes[vote].id == party) {
                return this.props.constituency.votes[vote].votes;
            }
        }
        return 0;
    },
    setPrimarySeats: function(e) {
        this.props.setPrimarySeats(this.props.constituency.id, e.target.value);
    },
    setAdjustmentSeats: function(e) {
        this.props.setAdjustmentSeats(this.props.constituency.id, e.target.value);
    },
    render: function() {
        var self = this;
        ////console.log(this.props)
        var partyFields = this.props.parties.map(function(party) {
            return (
                <td>
                    <input
                        className="vote-field"
                        data-party={party.id}
                        value={self.getPartyVotes(party.id)}
                        onChange={self.setPartyVotes}
                        />
                </td>
            )
        });

        return (
            <tr>
                <th>
                    <input
                        value={this.props.constituency.name}
                        onChange={this.setName}/>
                </th>
                <td>
                    <input
                        className="vote-field"
                        value={this.props.constituency.primarySeats}
                        onChange={this.setPrimarySeats}/>
                </td>
                <td>
                    <input
                        className="vote-field"
                        value={this.props.constituency.adjustmentSeats}
                        onChange={this.setAdjustmentSeats}/>
                </td>
                {partyFields}
                <td><a className="btn btn-sm btn-warning" onClick={this.remove}>Remove</a></td>
            </tr>
        );
    }
});

const VotesToolbar = (props) => {
    const presets = props.data.presets.map((item, i) => {
        return (
            <RBS.MenuItem eventKey={i} onClick={props.setPreset.bind(this, item)}>{item.name}</RBS.MenuItem>
        )
    })
    return (
        <RBS.Row>
            <RBS.Col xs={12}>
              <RBS.ButtonToolbar>
                <RBS.Button bsStyle="primary" onClick={props.addConstituency}>Add constituency</RBS.Button>
                <RBS.Button bsStyle="success" onClick={props.addParty}>Add party</RBS.Button>
                <RBS.Button bsStyle="info" onClick={props.votesReset}>Reset</RBS.Button>
                <RBS.DropdownButton title="Presets" id="bg-nested-dropdown">
                    {presets}
                </RBS.DropdownButton>
              </RBS.ButtonToolbar>
            </RBS.Col>
        </RBS.Row>
    )
}

var VotesTable = React.createClass({
    setPartyName: function(e) {
        this.props.setPartyName(e.target.dataset.id, e.target.value);
    },
    removeParty: function(e) {
        this.props.removeParty(e.target.dataset.id);
    },

    render: function() {
        ////console.log(this.props.data);
        var self = this;
        var constituencyNodes = this.props.data.constituencies.map(function(constituency) {
            return (
                <VotesConstituency
                    data={self.props.data}
                    constituency={constituency}
                    {...self.props}/>
            );
        });
        ////console.log(self.props.data)
        var partyNodes = self.props.parties.map(function(party) {
            return (
                <th>
                    <input
                        className="vote-field"
                        data-id={party.id}
                        value={party.name}
                        onChange={self.setPartyName}
                        />
                    <a
                        className="btn btn-xs btn-warning"
                        data-id={party.id}
                        onClick={self.removeParty}
                        >Remove</a>
                </th>
            );
        });

        return (
            <table className="table table-bordered table-hover table-striped">
                <thead>
                <tr>
                    <th>Constituency</th>
                    <th>Constituency seats</th>
                    <th>Adjustment seats</th>
                    {partyNodes}
                </tr>
                </thead>
                <tbody>
                {constituencyNodes}
                </tbody>
            </table>
        );
    }
});

var VotesSettings = React.createClass({
    setdivider_rule: function(e) {
        this.props.setdivider_rule(e.target.value);
    },

    setadjustmentdivider_rule: function(e) {
        this.props.setadjustmentdivider_rule(e.target.value);
    },

    setadjustment_method: function(e) {
        this.props.setadjustment_method(e.target.value);
    },
    setadjustment_threshold: function(e) {
        this.props.setadjustment_threshold(parseFloat(e.target.value));
    },
    render: function() {
        var divider_rules = [];
        var adjustmentdivider_rules = [];
        var adjustment_methods = [];


        if (!this.props.data.capabilities_loaded) {
            return <div>Capabilities not loaded</div>;
        }

        for (var id in this.props.data.capabilities.divider_rules) {
            var method = this.props.data.capabilities.divider_rules[id];
            var checked = (id == this.props.data.election_rules.primary_divider);
            if (checked) {
              divider_rules.push(<option selected value={id}>{method}</option>);
            } else {
              divider_rules.push(<option value={id}>{method}</option>);
            }
        }

        for (var id in this.props.data.capabilities.divider_rules) {
            var method = this.props.data.capabilities.divider_rules[id];
            var checked = (id == this.props.data.election_rules.adjustment_divider);
            if (checked) {
              adjustmentdivider_rules.push(<option selected value={id}>{method}</option>);
            } else {
              adjustmentdivider_rules.push(<option value={id}>{method}</option>);
            }
        }

        for (var id in this.props.data.capabilities.adjustment_methods) {
            var method = this.props.data.capabilities.adjustment_methods[id];
            var checked = (id == this.props.data.election_rules.adjustment_method);
            if (checked) {
                adjustment_methods.push(<option selected value={id}>{method}</option>);
            } else {
                adjustment_methods.push(<option value={id}>{method}</option>);
            }
        }

        return (
            <RBS.Grid fluid={true}>
            <RBS.Row>
            <RBS.Col xs={8} md={6}>
                <form>
                    <div className="form-group">
                        <label htmlFor="divider_rule">Primary divider rule</label>
                        <select
                            className="form-control"
                            id="divider_rule"
                            onChange={this.setdivider_rule}
                        >
                            {divider_rules}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="adjustmentdivider_rule">Adjustment divider rule</label>
                        <select
                            className="form-control"
                            id="adjustmentdivider_rule"
                            onChange={this.setadjustmentdivider_rule}
                        >
                            {adjustmentdivider_rules}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="adjustment_method">Adjustment method</label>
                        <select
                            className="form-control"
                            id="adjustment_method"
                            onChange={this.setadjustment_method}
                        >
                            {adjustment_methods}
                        </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="adjustment_threshold">Adjustment Threshold</label>
                      <span> <RBS.Badge className="badge-success">{Math.round(this.props.data.election_rules.adjustment_threshold * 100)}%</RBS.Badge></span>
                      <input
                          className="form-control"
                          id="adjustment_threshold"
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={this.props.data.election_rules.adjustment_threshold}
                          onChange={this.setadjustment_threshold}/>

                    </div>
                </form>
            </RBS.Col>
            </RBS.Row>
            </RBS.Grid>
        )
    }
});

var VotesResults = React.createClass({
    getPartyById: function(id) {
        for (var p in this.props.data.parties) {
            if (this.props.data.parties[p].id == id) {
                return this.props.data.parties[p];
            }
        }
        return {"id": -1, "name": "Error", "votes": 0};
    },

    render: function() {
        var res = "";
        var rules = this.props.data.election_rules;
        var caps = this.props.data.capabilities;
        var seats = this.props.data.results.seat_allocations

        if (!this.props.data.capabilities_loaded) {
            return <div>Capabilities not loaded</div>;
        }

        var tallyMethod = caps.divider_rules[rules.divider_rule];
        var constituencies = [];

        for (var c in this.props.data.constituencies) {
            var cons = this.props.data.constituencies[c];
            var consvotes = [];
            var rounds = []; // tallyMethod.func(cons.votes, cons.primarySeats);

            var rv = [];
            var sa = [];

            for (var cand in this.props.data.parties) {
                rv.push(<th>{this.props.data.parties[cand]['name']}</th>);
                if (seats !== undefined) {
                  sa.push(<td>{seats[c][cand]}</td>)
                }
            }
            //console.log(sa)
            rv.push(<th>Winner</th>);
            consvotes.push(<thead><tr>{rv}</tr></thead>);
            consvotes.push(<tr>{sa}</tr>)
            var rb = [];
            for (var round in rounds) {
                var rv = [];
                var roundno = parseInt(round)+1;
                rv.push(<th>Seat {roundno}</th>);
                for (var cand in rounds[round].votes) {
                    var v = Math.round(rounds[round].votes[cand], 2)
                    rv.push(<td>{v}</td>);
                }
                rv.push(<td>{this.getPartyById(rounds[round].winner).name}</td>);
                rb.push(
                    <tr>
                        {rv}
                    </tr>
                )
            }
            consvotes.push(<tbody>{rb}</tbody>)

            var conswinners = [];
            var winners = {};
            for (var party in this.props.data.parties) {
                winners[this.props.data.parties[party].id] = 0;
            }
            for (var round in rounds) {
                winners[rounds[round].winner]++;
            }
            for (var winner in winners) {
                conswinners.push(<li>{this.getPartyById(winner).name}: {winners[winner]}</li>);
            }


            constituencies.push(
                <div>
                    <h2>{cons.name}</h2>
                    <table className="table table-bordered table-striped">
                        {consvotes}
                    </table>
                    <ul>
                        {conswinners}
                    </ul>
                </div>
            )
        }

        return (
            <div> 
                {constituencies}
                <pre>{res}</pre>
            </div>
        )
    }
});

var VotingSimulator = React.createClass({
    getInitialState: function() {
        var init = {
            key: 1,
            constituencies: [],
            parties: [],
            election_rules: {},
            simulation_rules: {},
            presets: [],
            capabilities: {},
            capabilities_loaded: false,
            votes: [],
            errors: [],
            results: {}
        };
        // $.getJSON('/api/capabilities/', {}, this.getCapabilities);
        return init;
    },

    componentDidMount: function() {
        Client.getCapabilities( (data) => {
            //console.log("Found presets: ", data.presets);
            this.setState({
                capabilities: data.capabilities,
                election_rules: data.election_rules,
                simulation_rules: data.simulation_rules,
                presets: data.presets,
                capabilities_loaded: true,
                //errors: data.presets.map((p) => ('error' in p ? p.error: []))
                errors: data.presets.filter(p => {if('error' in p) return p.error})
            })
        });
    },

    handleSelect(key) {
        this.setState({key});
    },

    debugInfo() {
        //console.log("Debug: ", this.state);
    },

    removeConstituency: function(id) {
        var con = this.state.constituencies.filter(function( obj ) {
            return obj.id !== id;
        });
        this.setState({constituencies: con});
    },

    removeParty: function(id) {
        var con = this.state.parties.filter(function( obj ) {
            return obj.id !== id;
        });
        this.setState({parties: con});
    },

    setdivider_rule: function(method) {
        var set = jQuery.extend(true, {}, this.state.election_rules);
        set.primary_divider = method;
        this.setState({election_rules: set});
    },

    setadjustmentdivider_rule: function(method) {
        var set = jQuery.extend(true, {}, this.state.election_rules);
        set.adjustment_divider = method;
        this.setState({election_rules: set});
    },

    setadjustment_method: function(method) {
        var set = jQuery.extend(true, {}, this.state.election_rules);
        set.adjustment_method = method;
        this.setState({election_rules: set});
    },

    setadjustment_threshold: function(val) {
      const rules = this.state.election_rules
      rules.adjustment_threshold = val
      this.setState({election_rules: rules})

    },

    setConstituencyName: function(id, name) {
        var con = this.state.constituencies.map(function( obj ) {
            if (obj.id == id) {
                obj.name = name;
            }
            return obj;
        });
        this.setState({constituencies: con});
    },

    setPrimarySeats: function(id, primarySeats) {
        var con = this.state.constituencies.map(function( obj ) {
            if (obj.id == id) {
                obj.primarySeats = primarySeats;
            }
            return obj;
        });
        this.setState({constituencies: con});
    },

    setAdjustmentSeats: function(id, adjustmentSeats) {
        var con = this.state.constituencies.map(function( obj ) {
            if (obj.id == id) {
                obj.adjustmentSeats = adjustmentSeats;
            }
            return obj;
        });
        this.setState({constituencies: con});
    },

    setPartyName: function(id, name) {
        var con = this.state.parties.map(function( obj ) {
            if (obj.id == id) {
                obj.name = name;
            }
            return obj;
        });
        this.setState({parties: con});
    },

    addConstituency: function() {
        var constituencies = this.state.constituencies.slice();
        var votes = [];
        for (var p in this.state.parties) {
            votes.push({"id": this.state.parties[p].id, "votes": 0});
        }
        constituencies.push({"id": genRandomId(), "name": "New constituency", "votes": votes});
        this.setState({constituencies: constituencies});
    },

    addParty: function() {

        var parties = this.state.parties.slice();
        ////console.log(parties)
        var partyId = genRandomId();
        var party = {"id": partyId, "name": "?"};
        parties.push(party);

        var con = this.state.constituencies.map(function(cons) {
            cons.votes.push({"id": partyId, "votes": 0});
            return cons;
        });

        this.setState({constituencies: con, parties: parties});
    },

    setPartyVotes: function(constituency, party, votes) {
        var self = this;
        var con = this.state.constituencies.map(function( obj ) {
            if (obj.id == constituency) {
                var found = false;
                for(var i = 0; i < obj.votes.length; i++) {
                    if (obj.votes[i].id == party) {
                        found = true;
                        break;
                    }
                }

                if (found) {
                    obj.votes = obj.votes.map(function(v) {
                        if (v.id == party) {
                            v.votes = votes;
                        }
                        return v;
                    });
                } else {
                    obj.votes.push({"id": party, "votes": votes});
                }
            }
            return obj;
        });
        this.setState({constituencies: con});
    },

    votesReset: function() {
        this.setState({
            constituencies: [],
            parties: []
        });
    },


    addPresetConstituency: function(data) {
        let parties = data.parties.map((party) => ({id: genRandomId(), name: party}))

        const constituencies = data.constituency_names.map((con, i) => ({
            "id": genRandomId(),
            "name": con,
            "primarySeats": data.constituency_seats[i].toString(),
            "adjustmentSeats": data.constituency_adjustment_seats[i].toString(),
            "votes": data.votes[i].map((vote, n) => ({
                votes: vote.toString(),
                id: parties[n].id.toString()
            }))
        }))
        //console.log(constituencies)
        this.setState({
            constituencies: constituencies,
            parties: parties,
            election_rules: data
        });
    },

    setPreset: function(preset) {
        ////console.log(preset)
        ////console.log(this.state.presets)
        if (!this.state.presets.includes(preset)) {
            alert('Preset ' + preset + ' does not exist');
        }

        this.addPresetConstituency(preset.election_rules)
    },

    calculate: function() {
      var rules = this.state;

      const constituencyNames = this.state.constituencies.map(con => con.name);
      const votes = this.state.constituencies.map(con => con.votes.map(votes => parseInt(votes.votes)));
      const adjustmentSeats = this.state.constituencies.map(con => parseInt(con.adjustmentSeats));
      const primarySeats = this.state.constituencies.map(con => parseInt(con.primarySeats));
      const parties = this.state.parties.map(p => p.name);

      rules.election_rules['constituency_names'] = constituencyNames
      rules.election_rules['constituency_adjustment_seats'] = adjustmentSeats
      rules.election_rules['constituency_seats'] = primarySeats
      rules.election_rules['votes'] = votes
      rules.election_rules['parties'] = parties

      //console.log(votes)
      rules["action"] = "election";
      var that = this

      //console.log("Calculating:", rules);
      $(function() {
        $.ajax({
          url: '/api/script/',
          type: "POST",
          data: JSON.stringify(rules),
          contentType: 'application/json; charset=utf-8',
          success: function(data) {
              console.log("Got response:", data);
              that.setState({results: data})
          },
          dataType: "json"
        });
      });
    },

    render: function() {
        //console.log(this.state)
        const errors = this.state.errors.map((error) => (
          <Alert bsStyle="danger">
            <strong>Opps</strong> {error.error}
          </Alert>
        ))
        //console.log(errors)
        return (
            <RBS.Tab.Container defaultActiveKey={2}>
                <RBS.Row className="clearfix">
                    <RBS.Col sm={12}>
                        <RBS.Nav bsStyle="tabs">
                            <RBS.NavItem eventKey={1}>Simulation</RBS.NavItem>
                            <RBS.NavItem eventKey={2}>Votes</RBS.NavItem>
                            <RBS.NavItem eventKey={3}>Election results</RBS.NavItem>
                            <RBS.NavItem eventKey={4}>Visualization</RBS.NavItem>
                            <RBS.NavItem eventKey={5}>Settings</RBS.NavItem>
                        </RBS.Nav>
                    </RBS.Col>
                    <RBS.Col sm={12}>
                        <RBS.Tab.Content animation>
                            <RBS.Tab.Pane eventKey={1}>
                                {'Not implemented'}
                            </RBS.Tab.Pane>
                            <RBS.Tab.Pane eventKey={2}>
                                <VotesToolbar
                                    addConstituency={this.addConstituency}
                                    addParty={this.addParty}
                                    votesReset={this.votesReset}
                                    setPreset={this.setPreset.bind(this)}
                                    data={this.state}
                                />
                                {errors}
                                <VotesTable
                                    data={this.state}
                                    constituencies={this.state.constituencies}
                                    parties={this.state.parties}
                                    removeConstituency={this.removeConstituency}
                                    removeParty={this.removeParty}
                                    setConstituencyName={this.setConstituencyName}
                                    setAdjustmentSeats={this.setAdjustmentSeats}
                                    setPrimarySeats={this.setPrimarySeats}
                                    setPartyName={this.setPartyName}
                                    setPartyVotes={this.setPartyVotes}
                                />
                            </RBS.Tab.Pane>
                            <RBS.Tab.Pane eventKey={3}>
                                <VotesResults
                                  divider_rules={this.state.capabilities.divider_rules}
                                  adjustment_methods={this.adjustment_methods}
                                  data={this.state}
                                />
                            </RBS.Tab.Pane>
                            <RBS.Tab.Pane eventKey={4}>
                                {'Not implemented'}
                            </RBS.Tab.Pane>
                            <RBS.Tab.Pane eventKey={5}>
                                <VotesSettings
                                    capabilities_loaded={this.state.capabilities_loaded}
                                    setdivider_rule={this.setdivider_rule}
                                    setadjustmentdivider_rule={this.setadjustmentdivider_rule}
                                    setadjustment_method={this.setadjustment_method}
                                    setadjustment_threshold={this.setadjustment_threshold.bind(this)}
                                    divider_rules={this.state.capabilities.divider_rules}
                                    adjustment_methods={this.adjustment_methods}
                                    data={this.state}
                                />
                            </RBS.Tab.Pane>
                        </RBS.Tab.Content>
                        <RBS.Row>
                            <RBS.Col xs={12}>
                              <RBS.ButtonToolbar>
                                <RBS.Button bsStyle="warning" onClick={this.debugInfo}>Debug info</RBS.Button>
                                <RBS.Button bsStyle="primary" onClick={this.calculate}>Calculate</RBS.Button>
                              </RBS.ButtonToolbar>
                            </RBS.Col>
                        </RBS.Row>
                    </RBS.Col>
                </RBS.Row>
            </RBS.Tab.Container>
        )
    },

});

ReactDOM.render(
    <RBS.Grid fluid={true}>
        <RBS.Row>
            <RBS.Col xs={12}>
                <VotingSimulator />
            </RBS.Col>
        </RBS.Row>
    </RBS.Grid>,
    document.getElementById('votes')
);

function genRandomId() {
    var length = 8;
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.split('');

    if (! length) {
        length = Math.floor(Math.random() * chars.length);
    }

    var str = '';
    for (var i = 0; i < length; i++) {
        str += chars[Math.floor(Math.random() * chars.length)];
    }
    return str;
}
