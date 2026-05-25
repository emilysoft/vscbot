{self, ...}: {
  config,
  pkgs,
  lib,
  ...
}: let
  cfg = config.services.vscbot;
in {
  options.services.vscbot = {
    enable = lib.mkEnableOption "vscbot Discord bot service";

    package = lib.mkOption {
      type = lib.types.package;
      default = self.packages.${pkgs.system}.default;
      description = "The vscbot package to execute.";
    };

    tokenFile = lib.mkOption {
      type = lib.types.path;
      description = "Path to an environment file containing secrets (e.g., DISCORD_TOKEN).";
    };

    databaseDir = lib.mkOption {
      type = lib.types.str;
      default = "/var/lib/discord-bots/vscbot-db";
      description = "El directorio donde el bot almacenará su base de datos.";
    };

    port = lib.mkOption {
      type = lib.types.port;
      default = 3000;
      description = "API port";
    };
  };

  config = lib.mkIf cfg.enable {
    users.users.vscbot = {
      isSystemUser = true;
      group = "vscbot";
    };
    users.groups.vscbot = {};

    systemd.services.vscbot = {
      description = "vscbot Discord Bot Service";
      after = ["network.target"];
      wantedBy = ["multi-user.target"];
      environment = {
        DATABASE_DIR = cfg.databaseDir;
        API_PORT = cfg.port;
      };
      serviceConfig = {
        ExecStart = "${cfg.package}/bin/vscbot";
        Restart = "on-failure";
        RestartSec = 5;
        User = "vscbot";
        Group = "vscbot";
        StateDirectory = lib.removePrefix "/var/lib/" cfg.databaseDir;
        EnvironmentFile = cfg.tokenFile;
        ProtectSystem = "strict";
        ProtectHome = true;
        NoNewPrivileges = true;
        PrivateTmp = true;
      };
    };
  };
}
