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
      hash = "sha256-yCuy/M5qQ3avmXacloWqhNJcBlomoA2fEvgIzH303Lw=";
      fetcherVersion = 4;
      pnpm = pkgs.pnpm;
    };

    nativeBuildInputs = [
      pkgs.nodejs_latest
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
      bs3_pkg=$(ls -d node_modules/.pnpm/better-sqlite3@*/node_modules/better-sqlite3)
      node_gyp=${pkgs.nodejs}/lib/node_modules/npm/node_modules/node-gyp/bin/node-gyp.js
      # force_build=1 evita que gyp se salte la compilacion al ver los prebuilds.
      node "$node_gyp" rebuild --nodedir=${pkgs.nodejs} --force_build=1 -C "$bs3_pkg"
      # El paquete trae binarios precompilados para glibc; se eliminan para que
      # se cargue el binario compilado contra el Node de nixpkgs.
      rm -f "$bs3_pkg"/prebuilds/*.node
      pnpm run build
      runHook postBuild
    '';

    installPhase = ''
      mkdir -p $out/lib/vscbot $out/bin
      # drizzle/ contiene las migraciones que DatabaseManager aplica al arrancar.
      cp -r dist drizzle node_modules package.json $out/lib/vscbot/
      cat > $out/bin/vscbot <<EOF
      #!${pkgs.bash}/bin/bash
      exec ${pkgs.nodejs}/bin/node $out/lib/vscbot/dist/index-vsc.js
      EOF
      chmod +x $out/bin/vscbot
    '';

    meta.description = "The elegant VSC Discord Bot backend";
  }
