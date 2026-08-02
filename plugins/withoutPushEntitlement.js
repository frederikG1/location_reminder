const { withEntitlementsPlist } = require("expo/config-plugins");

/**
 * Fjerner push-rettigheden `aps-environment` fra iOS-builden.
 *
 * expo-notifications sætter den automatisk, fordi pakken OGSÅ kan modtage
 * push fra en server. Denne app gør ikke: baggrundstasken kalder
 * scheduleNotificationAsync med trigger: null, altså en rent lokal
 * notifikation, og de kræver ingen rettighed overhovedet.
 *
 * Rettigheden er derfor ikke bare overflødig — et gratis Apple-udviklerhold
 * kan slet ikke udstede en provisioning-profil med push, så builden fejler på
 * et krav appen aldrig stiller. Skal appen en dag modtage rigtig push, er det
 * her pluginnet skal fjernes igen.
 *
 * Står bevidst SIDST i plugins-listen i app.json: mods kører i den rækkefølge
 * de tilføjes, så nøglen skal slettes efter det plugin der sætter den.
 */
module.exports = function withoutPushEntitlement(config) {
  return withEntitlementsPlist(config, (config) => {
    delete config.modResults["aps-environment"];
    return config;
  });
};
