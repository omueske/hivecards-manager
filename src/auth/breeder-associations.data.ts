export type BreederAssociationOption = {
  code: string;
  country: string;
  associationNumber: number;
  name: string;
};

const RAW_ASSOCIATIONS: Array<{ code: string; name: string }> = [
  { code: 'AT-99', name: 'ACA (Austrian Carnica Association)' },
  { code: 'BE-1', name: 'Honeybee Valley (Belgien)' },
  { code: 'BE-2', name: 'Limburgse Zwarte Bij (LZB vzw)' },
  { code: 'CH-50', name: 'Verein Schweizerischer Mellifera Bienenfreunde' },
  { code: 'CH-51', name: "Société Romande d'Apiculture, Schweiz" },
  { code: 'CH-52', name: 'SCIV - Schweizerische Carnicaimker Vereinigung' },
  { code: 'DE-1', name: 'Landesverband Badischer Imker e.V.' },
  { code: 'DE-10', name: 'Imkerverband Rheinland-Pfalz e.V.' },
  { code: 'DE-11', name: 'Imkerverband Rheinland e.V.' },
  { code: 'DE-12', name: 'Landesverband Saarländischer Imker e.V.' },
  { code: 'DE-13', name: 'Landesverband Sächsischer Imker e.V.' },
  { code: 'DE-14', name: 'Imkerverband Sachsen-Anhalt e.V.' },
  { code: 'DE-15', name: 'Landesverband Schleswig-Holsteinischer und Hamburger Imker e.V.' },
  { code: 'DE-16', name: 'Landesverband Thüringer Imker e.V.' },
  { code: 'DE-17', name: 'Landesverband der Imker Weser-Ems e.V.' },
  { code: 'DE-18', name: 'Landesverband Westfälischer und Lippischer Imker e.V.' },
  { code: 'DE-19', name: 'Landesverband Württembergischer Imker e.V.' },
  { code: 'DE-2', name: 'Landesverband Bayerischer Imker e.V.' },
  { code: 'DE-23', name: 'Imkerverband Berlin e.V./Mellifera' },
  { code: 'DE-24', name: 'Landesverband Brandenburgischer Imker e.V./Mellifera' },
  { code: 'DE-28', name: 'Landesverband der Imker Mecklenburg Vorpommern e.V./Mellifera' },
  { code: 'DE-3', name: 'Imkerverband Berlin e.V.' },
  { code: 'DE-30', name: 'Imkerverband Rheinland-Pfalz e.V./Mellifera' },
  { code: 'DE-33', name: 'Landesverband Sächsischer Imker e.V./Mellifera' },
  { code: 'DE-34', name: 'Imkerverband Sachsen-Anhalt e.V./Mellifera' },
  { code: 'DE-35', name: 'Landesverband Schleswig-Holsteinischer und Hamburger Imker e.V./Mellifera' },
  { code: 'DE-4', name: 'Landesverband Brandenburgischer Imker e.V.' },
  { code: 'DE-5', name: 'Imkerverband Hamburg e.V.' },
  { code: 'DE-6', name: 'Landesverband Hannoverscher Imker e.V.' },
  { code: 'DE-7', name: 'Landesverband Hessischer Imker e.V.' },
  { code: 'DE-8', name: 'Landesverband der Imker Mecklenburg Vorpommern e.V.' },
  { code: 'DE-9', name: 'Imkerverband Nassau e.V.' },
  { code: 'ES-1', name: 'ERBEL' },
  { code: 'FI-1', name: 'Suomen Mehiläishoitajain Liitto' },
  { code: 'FI-2', name: 'Finnland/Carnica' },
  { code: 'FR-1', name: 'Frankreich/SmartBees/Mellifera' },
  { code: 'FR-53', name: 'Frankreich' },
  { code: 'GR-1', name: 'Griechenland/Macedonica' },
  { code: 'GR-2', name: 'Griechenland/Adami' },
  { code: 'GR-3', name: 'Griechenland/Cecropia' },
  { code: 'HR-1', name: 'Kroatien/SmartBees' },
  { code: 'HR-30', name: 'Belegstelle in Kroatien für Carnica-Züchter' },
  { code: 'HU-1', name: 'Ungarn/SmartBees' },
  { code: 'IT-1', name: 'Ligustica Zucht Italien/Abruzzo' },
  { code: 'IT-2', name: 'Associazione Italiana Allevatori Api Regine - AIAAR' },
  { code: 'IT-20', name: 'Carnica Züchter Südtirol' },
  { code: 'IT-21', name: 'Italien/Siciliana' },
  { code: 'IT-23', name: 'Italien/SmartBees/Carnica, Friuli' },
  { code: 'IT-3', name: 'SmartBees group Italy' },
  { code: 'LT-1', name: 'Litauen/SmartBees' },
  { code: 'LU-59', name: 'Luxemburg' },
  { code: 'MD-1', name: 'Moldawien' },
  { code: 'MK-1', name: 'MacBee Mazedonien' },
  { code: 'MT-1', name: 'Breeds of Origin Conservancy, Malta' },
  { code: 'NL-55', name: 'Niederlande' },
  { code: 'NO-1', name: 'Norwegen/Mellifera' },
  { code: 'NO-2', name: 'Norwegen/Carnica' },
  { code: 'PL-1', name: 'Polen/SmartBees/Mellifera' },
  { code: 'PL-2', name: 'Polen/SmartBees' },
  { code: 'PL-3', name: 'Polen, Lokalrasse' },
  { code: 'PT-1', name: 'SmartBees Portugal' },
  { code: 'RO-1', name: 'Rumänien' },
  { code: 'RS-1', name: 'Serbien/Carnica,SmartBees' },
  { code: 'RS-2', name: 'Serbien/Macedonica' },
  { code: 'SE-1', name: 'Schweden' },
  { code: 'SI-1', name: 'Slowenien/SmartBees' },
  { code: 'UA-1', name: 'Ukraine/Carnica' },
  { code: 'UA-3', name: 'Objednannja matkariw Ukrajiny (OMU)' },
];

export const BREEDER_ASSOCIATIONS: BreederAssociationOption[] = RAW_ASSOCIATIONS.map((item) => {
  const [country, associationPart] = item.code.split('-');
  return {
    ...item,
    country,
    associationNumber: Number.parseInt(associationPart, 10),
  };
});

export function parseBreederAssociationCode(code: string): BreederAssociationOption | null {
  if (typeof code !== 'string') return null;
  const normalizedCode = code.trim().toUpperCase();
  return BREEDER_ASSOCIATIONS.find((item) => item.code === normalizedCode) ?? null;
}

export function findBreederAssociation(
  country?: string,
  associationNumber?: number,
): BreederAssociationOption | null {
  if (!country || !Number.isInteger(associationNumber)) return null;
  const normalizedCountry = country.trim().toUpperCase();
  return (
    BREEDER_ASSOCIATIONS.find(
      (item) => item.country === normalizedCountry && item.associationNumber === associationNumber,
    ) ?? null
  );
}
