{
  description = "Go 1.24";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = {
    self,
    nixpkgs,
    flake-utils,
  }:
    flake-utils.lib.eachDefaultSystem (
      system: let
        pkgs = import nixpkgs {inherit system;};
      in {
        overlays.default = final: prev: {
          go = final."go_1_24";
        };

        devShells.default = pkgs.mkShell rec {
          packages = with pkgs; [
            nodejs_22
            nodePackages.pnpm
            go
            gotools
            golangci-lint
            (pkgs.buildGoModule {
              pname = "go-blueprint";
              version = "0.10.5";
              src = pkgs.fetchFromGitHub {
                owner = "melkeydev";
                repo = "go-blueprint";
                rev = "v0.10.5";
                sha256 = "16gw9hcbbjhwnc8k4n2cdfszhma3pg9xcry067v4adpba728z7zh";
              };
              vendorHash = "sha256-WBzToupC1/O70OYHbKk7S73OEe7XRLAAbY5NoLL7xvw=";
            })
          ];

          shellHook = ''
            export GOPATH=$PWD/.gopath
            export GOBIN=$GOPATH/bin
            export PATH=$GOBIN:$PATH
          '';
        };
      }
    );
}