/**
 * this class keeps the local data
 * required by the application
 */
define(function(){
    var localSettingsRet = {
        INITIAL_START_BYTE : 0,
        INITIAL_END_BYTE : 1024 * 10 * 10,

        MIN_VALUE : 9999999999,
        MAX_VALUE : -9999999999,
        RATIO : 0.65,

        TOTAL_STRAT_COUNT : 15,
        DISPLAY_ROW_COUNT : 14,

        DATATYPE_STRING : "string",
        DATATYPE_NOMINAL : "nominal",
        DATATYPE_NUMERICAL : "numerical",
        DATATYPE_ORDINAL : "ordinal",
        DATATYPE_ERROR : "error",

        NUMERICAL_BIN_COUNT: 10
    };

    return {
        localSettings : function(){
            return localSettingsRet;
        }
    }
});