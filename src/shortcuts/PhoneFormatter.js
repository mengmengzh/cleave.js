'use strict';

var PhoneFormatter = function (formatter, delimiter) {
    var owner = this;

    owner.delimiter = (delimiter || delimiter === '') ? delimiter : ' ';
    owner.delimiterRE = delimiter ? new RegExp('\\' + delimiter, 'g') : '';

    owner.formatter = formatter;
};

PhoneFormatter.prototype = {
    setFormatter: function (formatter) {
        this.formatter = formatter;
    },

    format: function (phoneNumber) {
        var owner = this;

        if (typeof owner.formatter.reset === 'function') {
            owner.formatter.reset();
        } else {
            owner.formatter.clear();
        }

        // only keep number and +
        phoneNumber = phoneNumber.replace(/[^\d+]/g, '');

        // strip non-leading +
        phoneNumber = phoneNumber.replace(/^\+/, 'B').replace(/\+/g, '').replace('B', '+');

        // strip delimiter
        phoneNumber = phoneNumber.replace(owner.delimiterRE, '');

        var result = '', current, validated = false;

        for (var i = 0, iMax = phoneNumber.length; i < iMax; i++) {
            if (typeof owner.formatter.input === 'function') {
                current = owner.formatter.input(phoneNumber.charAt(i));
            } else {
                current = owner.formatter.inputDigit(phoneNumber.charAt(i));
            }

            // has ()- or space inside
            var isGb = false;
            var test = /[\s()-]/g.test(current);
            if (typeof owner.formatter.getNumber === 'function') {
                isGb = owner.formatter.getNumber() && owner.formatter.getNumber().country === 'GB';
                if (owner.formatter.getNumber() && owner.formatter.getNumber().country !== 'GB') {
                    test = test && owner.formatter.getNumber() && owner.formatter.getNumber().isPossible();
                }
            }
            if (test) {
                result = current;

                validated = true;
            } else {
                if (!validated || isGb) {
                    result = current;
                }
                // else: over length input
                // it turns to invalid number again
            }
        }

        // strip ()
        // e.g. US: 7161234567 returns (716) 123-4567
        // result = result.replace(/[()]/g, '');
        // replace library delimiter with user customized delimiter
        // result = result.replace(/[\s-]/g, owner.delimiter);

        return result;
    }
};

module.exports = PhoneFormatter;
