{pkgs, ...}: let
  src = ../.;
in
  pkgs.stdenv.mkDerivation {
    pname = "vscbot";
    version = "1.0.0";

    inherit src;

    pnpmDeps = pkgs.fetchPnpmDeps {
      pname = "vscbot";
      version = "1.0.0";
      inherit src;
      hash = "sha256-Z/HlJ2j/nQhufUY+Veg0wR0KUoUINHk8muSFGyZHQQU=";
      fetcherVersion = 3;
      pnpm = pkgs.pnpm;
    };

    nativeBuildInputs = [
      pkgs.nodejs
      pkgs.pnpm
      pkgs.pnpmConfigHook
      (pkgs.python3.withPackages (ps: [ps.distutils]))
      pkgs.gcc
    ];

    prePnpmInstall = ''
      export CI=true
    '';

    buildPhase = ''
      runHook preBuild
      sqlite3_pkg=$(ls -d node_modules/.pnpm/sqlite3@*/node_modules/sqlite3)
      node_gyp=$(ls -d node_modules/.pnpm/node-gyp@*/node_modules/node-gyp/bin/node-gyp.js)
      node "$node_gyp" rebuild --nodedir=${pkgs.nodejs} -C "$sqlite3_pkg"
      pnpm run build
      runHook postBuild
    '';

    installPhase = ''
      mkdir -p $out/lib/vscbot $out/bin
      cp -r dist node_modules package.json $out/lib/vscbot/
      cat > $out/bin/vscbot <<EOF
      #!${pkgs.bash}/bin/bash
      exec ${pkgs.nodejs}/bin/node $out/lib/vscbot/dist/index-vsc.js
      EOF
      chmod +x $out/bin/vscbot
    '';

    meta.description = "The elegant VSC Discord Bot backend";
  }
