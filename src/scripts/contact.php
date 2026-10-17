<?php
declare(strict_types=1);

date_default_timezone_set('Europe/Paris');

function rediriger(string $etat): void
{
    header('Location: ../contact.html?envoi=' . $etat . '#formulaire', true, 303);
    exit;
}

function lire_champ(string $nom, int $longueur): string
{
    $valeur = trim(str_replace("\0", '', (string) ($_POST[$nom] ?? '')));
    return function_exists('mb_substr') ? mb_substr($valeur, 0, $longueur, 'UTF-8') : substr($valeur, 0, $longueur);
}

function sur_une_ligne(string $texte): string
{
    return trim((string) preg_replace('/[\r\n\t]+/', ' ', $texte));
}

function encoder_entete(string $texte): string
{
    return '=?UTF-8?B?' . base64_encode($texte) . '?=';
}

function charger_configuration(): array
{
    foreach ([dirname(__DIR__, 2) . '/config-formulaire.php', __DIR__ . '/config-formulaire.php'] as $fichier) {
        if (is_file($fichier)) {
            $configuration = require $fichier;
            if (is_array($configuration)) {
                return $configuration;
            }
        }
    }
    throw new RuntimeException('Fichier config-formulaire.php introuvable.');
}

function smtp_lire($flux): array
{
    $reponse = '';
    while (($ligne = fgets($flux, 1024)) !== false) {
        $reponse .= $ligne;
        if (strlen($ligne) < 4 || $ligne[3] !== '-') {
            break;
        }
    }
    if ($reponse === '') {
        throw new RuntimeException('Pas de réponse du serveur SMTP.');
    }
    return [(int) substr($reponse, 0, 3), trim($reponse)];
}

function smtp_commande($flux, ?string $commande, array $codes): void
{
    if ($commande !== null) {
        fwrite($flux, $commande . "\r\n");
    }
    [$code, $reponse] = smtp_lire($flux);
    if (!in_array($code, $codes, true)) {
        throw new RuntimeException('SMTP : ' . $reponse);
    }
}

function envoyer_par_smtp(array $config, string $destinataire, string $entetes, string $corps): void
{
    $adresse = 'ssl://' . $config['smtp_hote'] . ':' . (int) $config['smtp_port'];
    $flux = @stream_socket_client($adresse, $numero, $erreur, 20);
    if ($flux === false) {
        throw new RuntimeException("Connexion SMTP impossible ($numero) : $erreur");
    }
    stream_set_timeout($flux, 20);
    try {
        smtp_commande($flux, null, [220]);
        smtp_commande($flux, 'EHLO ' . ($_SERVER['SERVER_NAME'] ?? 'localhost'), [250]);
        smtp_commande($flux, 'AUTH LOGIN', [334]);
        smtp_commande($flux, base64_encode((string) $config['smtp_utilisateur']), [334]);
        smtp_commande($flux, base64_encode((string) $config['smtp_mot_de_passe']), [235]);
        smtp_commande($flux, 'MAIL FROM:<' . $config['expediteur'] . '>', [250]);
        smtp_commande($flux, 'RCPT TO:<' . $destinataire . '>', [250, 251]);
        smtp_commande($flux, 'DATA', [354]);
        smtp_commande($flux, $entetes . "\r\n\r\n" . $corps . "\r\n.", [250]);
        fwrite($flux, "QUIT\r\n");
    } finally {
        fclose($flux);
    }
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    rediriger('erreur');
}

if (lire_champ('site_web', 200) !== '') {
    rediriger('ok');
}

$nom = sur_une_ligne(lire_champ('nom', 100));
$prenom = sur_une_ligne(lire_champ('prenom', 100));
$email = sur_une_ligne(lire_champ('email', 200));
$message = lire_champ('message', 5000);

if ($nom === '' || $message === '' || filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
    rediriger('erreur');
}

try {
    $config = charger_configuration();
    $destinataire = (string) $config['destinataire'];
    $expediteur = (string) $config['expediteur'];
    $domaine = substr((string) strrchr($expediteur, '@'), 1);
    $auteur = trim($prenom . ' ' . $nom);

    $corps = implode("\r\n", [
        'Nouveau message envoyé depuis le formulaire de contact du site.',
        '',
        'Nom : ' . $nom,
        'Prénom : ' . ($prenom !== '' ? $prenom : '—'),
        'Adresse mail : ' . $email,
        '',
        'Message :',
        (string) preg_replace("/\r\n|\r|\n/", "\r\n", $message),
        '',
        '—',
        'Pour répondre, utilisez simplement « Répondre » : la réponse partira vers ' . $email . '.',
    ]);
    $corpsEncode = rtrim(chunk_split(base64_encode($corps), 76, "\r\n"));
    $sujet = 'Message du site — ' . $auteur;

    $entetes = [
        'Date: ' . date(DATE_RFC2822),
        'From: ' . encoder_entete((string) $config['nom_expediteur']) . ' <' . $expediteur . '>',
        'Reply-To: ' . encoder_entete($auteur) . ' <' . $email . '>',
        'Message-ID: <' . bin2hex(random_bytes(16)) . '@' . $domaine . '>',
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: base64',
    ];

    if (!empty($config['smtp_mot_de_passe'])) {
        $entetesSmtp = array_merge($entetes, ['To: <' . $destinataire . '>', 'Subject: ' . encoder_entete($sujet)]);
        envoyer_par_smtp($config, $destinataire, implode("\r\n", $entetesSmtp), $corpsEncode);
    } elseif (!mail($destinataire, encoder_entete($sujet), $corpsEncode, implode("\r\n", $entetes), '-f' . $expediteur)) {
        throw new RuntimeException('La fonction mail() a échoué.');
    }
} catch (Throwable $erreur) {
    error_log('Formulaire de contact : ' . $erreur->getMessage());
    rediriger('erreur');
}

rediriger('ok');
