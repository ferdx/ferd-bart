var bart = require('working-bart').createClient();
var _ = require('underscore');

var stations = {
  '12th' : '12th St. Oakland City Center',
  '16th' : '16th St. Mission',
  '19th' : '19th St. Oakland',
  '24th' : '24th St. Mission',
  'ashb' : 'Ashby',
  'balb' : 'Balboa Park',
  'bayf' : 'Bay Fair',
  'cast' : 'Castro Valley',
  'civc' : 'Civic Center',
  'cols' : 'Coliseum/Oakland Airport',
  'colm' : 'Colma',
  'conc' : 'Concord',
  'daly' : 'Daly City',
  'dbrk' : 'Downtown Berkeley',
  'dubl' : 'Dublin/Pleasanton',
  'deln' : 'El Cerrito del Norte',
  'plza' : 'El Cerrito Plaza',
  'embr' : 'Embarcadero',
  'frmt' : 'Fremont',
  'ftvl' : 'Fruitvale',
  'glen' : 'Glen Park',
  'hayw' : 'Hayward',
  'lafy' : 'Lafayette',
  'lake' : 'Lake Merritt',
  'mcar' : 'MacArthur',
  'mlbr' : 'Millbrae',
  'mont' : 'Montgomery St.',
  'nbrk' : 'North Berkeley',
  'ncon' : 'North Concord/Martinez',
  'orin' : 'Orinda',
  'pitt' : 'Pittsburg/Bay Point',
  'phil' : 'Pleasant Hill',
  'powl' : 'Powell St.',
  'rich' : 'Richmond',
  'rock' : 'Rockridge',
  'sbrn' : 'San Bruno',
  'sfia' : 'San Francisco Intl Airport',
  'sanl' : 'San Leandro',
  'shay' : 'South Hayward',
  'ssan' : 'South San Francisco',
  'ucty' : 'Union City',
  'wcrk' : 'Walnut Creek',
  'wdub' : 'West Dublin',
  'woak' : 'West Oakland'
};

module.exports = function(ferd) {

  ferd.listen(/bart\s(12th|16th|19th|24th|ashb|balb|bayf|cast|civc|cols|colm|conc|daly|dbrk|dubl|deln|plza|embr|frmt|ftvl|glen|hayw|lafy|lake|mcar|mlbr|mont|nbrk|ncon|orin|pitt|phil|powl|rich|rock|sbrn|sfia|sanl|shay|ssan|ucty|wcrk|wdub|woak|help|map)/i, function(response) {
    var option = response.match[1];

    var from = response.incomingMessage.user;
    var to = response.slack.self.id;

    var getBart = function(param) {
      if(from !== to) {
        if(param === 'map' || param === 'help') {

          var bartMap = [{
                'fallback': 'BART abbreviations',
                'text': 'Usage: `ferd bart` *`powl`* with one of these station codes: ',
                'color': '#ffffff',
                'image_url': 'http://i.imgur.com/WM9ROJJ.png',
                'mrkdwn_in': ['text']
              }];

          response.postMessage({
            as_user: true,
            attachments: bartMap,
            mrkdwn: true
          });

        } else {
          if(stations[param]) {
            var leadingText = 'From *' + stations[param] + '* station:\n\n';
            bart.on(param, function (estimates) {

              // collapse trains for the same destination
              var collapse = function (trains) {
                return _.chain(trains)
                  .groupBy(function (train) {
                    return train.destination;
                  })
                  .sortBy(function (train) {
                    return train.destination;
                  });
              };
              
              var lines = collapse(estimates);

              var attachments = _(lines).reduce(function (memo, line) {
                    var dest = line[0].destination,
                        times = _(line).reduce(function (memo, train) {
                          return memo.concat('`'+train.minutes+'`');
                          }, []).join(', ');
                    var attachment = {
                          'fallback': dest + ' in ' + times + ' minutes.',
                          'text': '*' + dest + '* in ' + times + ' minutes.',
                          'color': line[0].hexcolor,
                          'mrkdwn_in': ['text']
                        };
                    return memo.concat(attachment);
                  }, []);
             
              response.postMessage({
                as_user: true,
                text: leadingText,
                mrkdwn: true,
                attachments: attachments
              });

            });
          } else {
            response.postMessage({
              as_user: true,
              text: 'There is no Bart station with that station code. Type `ferd bart help` to list Bart station codes.',
              mrkdwn: true
            });
          }
        }
      }
    };
    getBart(option);
  });
};
