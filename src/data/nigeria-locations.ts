/**
 * Nigeria states and a curated set of major LGAs per state (state capital plus
 * a few well-known LGAs) — not the exhaustive official list of all 774 LGAs.
 *
 * Cross-checked by hand against multiple sources since publicly available LGA
 * lists online are inconsistent (typos, missing/merged entries). Easy to
 * extend — just add more strings to a state's `lgas` array.
 */
export interface NigeriaState {
  state: string;
  lgas: string[];
}

export const NIGERIA_STATES: NigeriaState[] = [
  { state: "Abia", lgas: ["Umuahia North", "Umuahia South", "Aba North", "Aba South"] },
  { state: "Adamawa", lgas: ["Yola North", "Yola South", "Mubi North", "Mubi South"] },
  { state: "Akwa Ibom", lgas: ["Uyo", "Eket", "Ikot Ekpene", "Oron"] },
  { state: "Anambra", lgas: ["Awka South", "Onitsha North", "Onitsha South", "Nnewi North"] },
  { state: "Bauchi", lgas: ["Bauchi", "Katagum", "Misau", "Toro"] },
  { state: "Bayelsa", lgas: ["Yenagoa", "Ogbia", "Sagbama", "Brass"] },
  { state: "Benue", lgas: ["Makurdi", "Gboko", "Otukpo", "Vandeikya"] },
  { state: "Borno", lgas: ["Maiduguri", "Biu", "Bama", "Konduga"] },
  { state: "Cross River", lgas: ["Calabar Municipal", "Calabar South", "Ikom", "Ogoja"] },
  { state: "Delta", lgas: ["Oshimili South", "Warri South", "Sapele", "Ughelli North"] },
  { state: "Ebonyi", lgas: ["Abakaliki", "Afikpo North", "Ohaozara", "Ikwo"] },
  { state: "Edo", lgas: ["Oredo", "Egor", "Esan West", "Etsako Central"] },
  { state: "Ekiti", lgas: ["Ado-Ekiti", "Ikere", "Oye", "Ijero"] },
  { state: "Enugu", lgas: ["Enugu East", "Enugu North", "Enugu South", "Nsukka"] },
  { state: "FCT (Abuja)", lgas: ["Abuja Municipal", "Gwagwalada", "Kuje", "Bwari"] },
  { state: "Gombe", lgas: ["Gombe", "Billiri", "Kaltungo", "Dukku"] },
  { state: "Imo", lgas: ["Owerri Municipal", "Owerri North", "Owerri West", "Orlu"] },
  { state: "Jigawa", lgas: ["Dutse", "Hadejia", "Gumel", "Ringim"] },
  { state: "Kaduna", lgas: ["Kaduna North", "Kaduna South", "Zaria", "Jema'a"] },
  { state: "Kano", lgas: ["Kano Municipal", "Fagge", "Dala", "Nassarawa"] },
  { state: "Katsina", lgas: ["Katsina", "Daura", "Funtua", "Malumfashi"] },
  { state: "Kebbi", lgas: ["Birnin Kebbi", "Argungu", "Yauri", "Zuru"] },
  { state: "Kogi", lgas: ["Lokoja", "Okene", "Idah", "Ankpa"] },
  { state: "Kwara", lgas: ["Ilorin East", "Ilorin West", "Ilorin South", "Offa"] },
  { state: "Lagos", lgas: ["Ikeja", "Lagos Island", "Surulere", "Eti-Osa", "Alimosho"] },
  { state: "Nasarawa", lgas: ["Lafia", "Keffi", "Akwanga", "Karu"] },
  { state: "Niger", lgas: ["Chanchaga", "Bida", "Kontagora", "Suleja"] },
  { state: "Ogun", lgas: ["Abeokuta South", "Abeokuta North", "Ijebu Ode", "Sagamu"] },
  { state: "Ondo", lgas: ["Akure South", "Akure North", "Owo", "Ondo West"] },
  { state: "Osun", lgas: ["Osogbo", "Ife Central", "Ilesha East", "Iwo"] },
  {
    state: "Oyo",
    lgas: ["Ibadan North", "Ibadan North-East", "Ibadan South-West", "Ogbomosho North"]
  },
  { state: "Plateau", lgas: ["Jos North", "Jos South", "Bokkos", "Mangu"] },
  { state: "Rivers", lgas: ["Port Harcourt", "Obio/Akpor", "Eleme", "Okrika"] },
  { state: "Sokoto", lgas: ["Sokoto North", "Sokoto South", "Wamako", "Illela"] },
  { state: "Taraba", lgas: ["Jalingo", "Wukari", "Takum", "Bali"] },
  { state: "Yobe", lgas: ["Damaturu", "Potiskum", "Nguru", "Bade"] },
  { state: "Zamfara", lgas: ["Gusau", "Kaura Namoda", "Talata Mafara", "Anka"] }
];
